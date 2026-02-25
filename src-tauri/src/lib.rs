mod commands;

use commands::{read_file, rename_file, save_file, update_recent_menu};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Emitter, Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            save_file,
            rename_file,
            update_recent_menu
        ])
        .setup(|app| {
            // Build the standard macOS App menu (MD Lite, Edit, Window, etc.)
            let app_menu = Submenu::with_items(
                app,
                "MD Lite",
                true,
                &[
                    &PredefinedMenuItem::about(app, None, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::show_all(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?;

            let new_file =
                MenuItem::with_id(app, "menu-new-file", "New File", true, Some("CmdOrCtrl+N"))?;
            let open_file =
                MenuItem::with_id(app, "menu-open-file", "Open…", true, Some("CmdOrCtrl+O"))?;

            // Placeholder for Open Recent
            let open_recent = tauri::menu::SubmenuBuilder::new(app, "Recent")
                .id("open-recent-menu")
                .item(&MenuItem::with_id(
                    app,
                    "menu-recent-placeholder",
                    "No recent files",
                    false,
                    None::<&str>,
                )?)
                .build()?;

            let save_file_item =
                MenuItem::with_id(app, "menu-save-file", "Save", true, Some("CmdOrCtrl+S"))?;
            let save_as_item = MenuItem::with_id(
                app,
                "menu-save-as",
                "Save As…",
                true,
                Some("CmdOrCtrl+Shift+S"),
            )?;

            let file_menu = Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &new_file,
                    &open_file,
                    &open_recent,
                    &PredefinedMenuItem::separator(app)?,
                    &save_file_item,
                    &save_as_item,
                ],
            )?;

            app.manage(open_recent.clone());

            // Edit menu (essential for copy/paste shortcuts on macOS)
            let edit_menu = Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?;

            // View Menu (to toggle fullscreen, devtools, etc)
            let view_menu = Submenu::with_items(
                app,
                "View",
                true,
                &[&PredefinedMenuItem::fullscreen(app, None)?],
            )?;

            // Window Menu
            let window_menu = Submenu::with_items(
                app,
                "Window",
                true,
                &[
                    &PredefinedMenuItem::minimize(app, None)?,
                    &PredefinedMenuItem::maximize(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::close_window(app, None)?,
                ],
            )?;

            let menu = Menu::with_items(
                app,
                &[&app_menu, &file_menu, &edit_menu, &view_menu, &window_menu],
            )?;
            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            // Forward the menu event ID as a global event to the Svelte frontend
            let id = event.id().as_ref();
            if let Some(path) = id.strip_prefix("menu-open-recent||") {
                let _ = app.emit("open-recent", path);
            } else if id.starts_with("menu-") {
                let _ = app.emit(id, ());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
