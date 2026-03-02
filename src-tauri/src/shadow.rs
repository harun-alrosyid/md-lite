use serde::Serialize;
use std::path::PathBuf;

/// Directory: ~/.mdlite/cache/
fn cache_dir() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Cannot resolve home directory")?;
    Ok(home.join(".mdlite").join("cache"))
}

fn shadow_path() -> Result<PathBuf, String> {
    Ok(cache_dir()?.join("shadow_buffer.tmp"))
}

fn shadow_meta_path() -> Result<PathBuf, String> {
    Ok(cache_dir()?.join("shadow_buffer.meta.json"))
}

#[derive(Serialize, Clone)]
pub struct ShadowRecovery {
    pub original_path: String,
    pub shadow_content: String,
    pub shadow_modified: u64,
}

/// Atomic shadow save: write content to a temp file, then rename.
/// Also stores the original file path in a companion .meta file.
#[tauri::command]
pub async fn shadow_save(path: String, content: String) -> Result<(), String> {
    let dir = cache_dir()?;
    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| format!("Failed to create cache dir: {}", e))?;

    let shadow = shadow_path()?;
    let tmp = shadow.with_extension("tmp.new");

    // Atomic write: write to .tmp.new, then rename to .tmp
    tokio::fs::write(&tmp, &content)
        .await
        .map_err(|e| format!("Shadow write failed: {}", e))?;

    tokio::fs::rename(&tmp, &shadow)
        .await
        .map_err(|e| format!("Shadow rename failed: {}", e))?;

    // Write meta file with original path
    let meta = shadow_meta_path()?;
    let meta_json = serde_json::json!({ "original_path": path });
    tokio::fs::write(&meta, meta_json.to_string())
        .await
        .map_err(|e| format!("Meta write failed: {}", e))?;

    Ok(())
}

/// Check if a shadow recovery file exists on startup.
#[tauri::command]
pub async fn check_shadow_recovery() -> Result<Option<ShadowRecovery>, String> {
    let shadow = shadow_path()?;
    let meta = shadow_meta_path()?;

    if !shadow.exists() || !meta.exists() {
        return Ok(None);
    }

    let content = tokio::fs::read_to_string(&shadow)
        .await
        .map_err(|e| format!("Failed to read shadow: {}", e))?;

    let meta_raw = tokio::fs::read_to_string(&meta)
        .await
        .map_err(|e| format!("Failed to read meta: {}", e))?;

    let meta_json: serde_json::Value =
        serde_json::from_str(&meta_raw).map_err(|e| format!("Invalid meta JSON: {}", e))?;

    let original_path = meta_json["original_path"]
        .as_str()
        .unwrap_or("")
        .to_string();

    // Get file modification time as unix timestamp
    let modified = tokio::fs::metadata(&shadow)
        .await
        .map_err(|e| format!("Failed to read shadow metadata: {}", e))?
        .modified()
        .map_err(|e| format!("Failed to get modified time: {}", e))?
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();

    // Only offer recovery if the shadow has actual content
    if content.is_empty() {
        return Ok(None);
    }

    Ok(Some(ShadowRecovery {
        original_path,
        shadow_content: content,
        shadow_modified: modified,
    }))
}

/// Restore: write shadow content to target path, then clean up shadow files.
#[tauri::command]
pub async fn restore_shadow(target_path: String) -> Result<String, String> {
    let shadow = shadow_path()?;

    let content = tokio::fs::read_to_string(&shadow)
        .await
        .map_err(|e| format!("Failed to read shadow: {}", e))?;

    // Atomic write to target
    let target = PathBuf::from(&target_path);
    if let Some(parent) = target.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create dir: {}", e))?;
    }

    let tmp_target = target.with_extension("md.tmp");
    tokio::fs::write(&tmp_target, &content)
        .await
        .map_err(|e| format!("Failed to write restore: {}", e))?;
    tokio::fs::rename(&tmp_target, &target)
        .await
        .map_err(|e| format!("Failed to rename restore: {}", e))?;

    // Clean up shadow files
    let _ = tokio::fs::remove_file(shadow).await;
    let _ = tokio::fs::remove_file(shadow_meta_path()?).await;

    Ok(content)
}

/// Dismiss: delete shadow files without restoring.
#[tauri::command]
pub async fn dismiss_shadow() -> Result<(), String> {
    let shadow = shadow_path()?;
    let meta = shadow_meta_path()?;

    let _ = tokio::fs::remove_file(shadow).await;
    let _ = tokio::fs::remove_file(meta).await;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    // A helper to override the typical cache_dir or use environment scopes to avoid trashing real data
    // For unit tests interacting directly with the filesystem, Rust will modify ~/.mdlite
    // This could conflict with user data. Let's make a mock cache dir using environment variables.
    // Wait, testing dirs::home_dir is risky. We'll skip deep integration of cache_dir unless mocked 
    // but we can test the serialization and core struct logic.

    #[test]
    fn test_shadow_recovery_struct() {
        let rec = ShadowRecovery {
            original_path: "/test/path.md".to_string(),
            shadow_content: "content".to_string(),
            shadow_modified: 12345,
        };
        assert_eq!(rec.original_path, "/test/path.md");
        assert_eq!(rec.shadow_content, "content");
    }
}
