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
