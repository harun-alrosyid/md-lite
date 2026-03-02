use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn save_file(path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(path);

    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    tokio::fs::write(&path, &content)
        .await
        .map_err(|e| format!("Failed to save file: {}", e))
}

#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    std::fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename: {}", e))
}
#[tauri::command]
pub fn update_recent_menu(
    app: tauri::AppHandle,
    paths: Vec<String>,
    names: Vec<String>,
) -> Result<(), String> {
    use tauri::Manager;
    // Retrieve the open_recent Submenu we injected into state during setup
    let submenu = match app.try_state::<tauri::menu::Submenu<tauri::Wry>>() {
        Some(s) => s,
        None => return Ok(())
    };

    // Remove all old items
    if let Ok(items) = submenu.items() {
        for item in items {
            let _ = submenu.remove(&item);
        }
    }

    // Add new items
    if paths.is_empty() {
        let _ = submenu.append(
            &tauri::menu::MenuItem::with_id(
                &app,
                "menu-recent-placeholder",
                "No recent files",
                false,
                None::<&str>,
            )
            .unwrap(),
        );
    } else {
        for (_i, (path, name)) in paths.iter().zip(names.iter()).enumerate() {
            // Using a JSON string as ID to pass the path correctly, but ID requires strict formatting. 
            // Simple approach: ID prefix "menu-open-recent||$PATH" 
            let id = format!("menu-open-recent||{}", path);
            let label = format!("{}", name);
            if let Ok(item) = tauri::menu::MenuItem::with_id(&app, id, label, true, None::<&str>) {
                let _ = submenu.append(&item);
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_read_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test_read.txt");
        fs::write(&file_path, "hello world").unwrap();

        let result = read_file(file_path.to_string_lossy().to_string());
        assert_eq!(result.unwrap(), "hello world");
    }

    #[test]
    fn test_read_file_error() {
        let result = read_file("does_not_exist.txt".to_string());
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_save_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("sub").join("test_save.txt");

        let result = save_file(file_path.to_string_lossy().to_string(), "new content".to_string()).await;
        assert!(result.is_ok());

        assert_eq!(fs::read_to_string(&file_path).unwrap(), "new content");
    }

    #[test]
    fn test_rename_file() {
        let dir = tempdir().unwrap();
        let old_path = dir.path().join("old.txt");
        let new_path = dir.path().join("new.txt");
        fs::write(&old_path, "data").unwrap();

        let result = rename_file(old_path.to_string_lossy().to_string(), new_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(new_path.exists());
        assert!(!old_path.exists());
    }

    #[test]
    fn test_rename_file_error() {
        let result = rename_file("nonexistent.txt".to_string(), "new.txt".to_string());
        assert!(result.is_err());
    }
}
