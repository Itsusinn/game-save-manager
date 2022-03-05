import { ipcMain, shell, dialog, nativeImage } from "electron";
import { get_config } from "./config";
import {
    get_game_saves_info,
    backup_save,
    apply_backup,
    create_game_backup,
} from "./saveManager";
import { Config, Game, Saves, Save } from "./saveTypes";

export function init_ipc() {
    ipcMain.on("open_url", async (Event, arg) => {
        // 打开URL
        shell.openExternal(arg);
        Event.reply("reply_open_url", true);
    });
    ipcMain.on("choose_save_directory", async (Event) => {
        // 选择游戏存档目录
        const path = dialog.showOpenDialog({
            title: "请选择存档路径",
            properties: ["openDirectory"],
        });
        Event.reply("reply_choose_save_directory", await path);
    });

    ipcMain.on("choose_executable_file", async (Event) => {
        // 选择游戏可执行文件
        const path = dialog.showOpenDialog({
            title: "选择游戏可执行文件",
            properties: ["openFile"],
            filters: [
                {
                    name: "可执行程序",
                    extensions: ["exe", "bat", "cmd", "jar"],
                },
            ],
        });
        Event.reply("reply_choose_executable_file", await path);
    });

    ipcMain.on("choose_game_icon", async (Event) => {
        // 选择游戏图标
        const path = dialog.showOpenDialog({
            title: "选择游戏图标",
            properties: ["openFile"],
            filters: [
                { name: "可识别图片", extensions: ["jpg", "png", "ico"] },
            ],
        });
        const icon = nativeImage.createFromPath((await path).filePaths[0]);
        if (icon == undefined) {
            return;
        }
        Event.reply("reply_choose_game_icon", icon.toDataURL());
    });

    ipcMain.on("get_config", async (Event) => {
        // 返回本地的配置文件
        let config = get_config();
        Event.reply("reply_config", config);
    });

    ipcMain.on("backup", (Event, args) => {
        let game_name = args.game_name;
        let describe = args.describe;
        let tags = args.tags;

        backup_save(game_name, describe, tags);
        Event.reply("reply_backup", true);
    });

    ipcMain.on("add_game", (Event, arg) => {
        console.log("保存游戏信息：", arg);
        if (arg.game_path) {
            create_game_backup(
                arg.game_name,
                arg.save_path,
                arg.icon,
                arg.game_path
            );
        } else {
            create_game_backup(arg.game_name, arg.save_path, arg.icon);
        }
        Event.reply("reply_add_game", true);
    });
}
