const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

const DEBUG = false;

class VpnStatusApplet extends Applet.TextIconApplet {
    constructor(metadata, orientation, panelHeight, instance_id) {
        super(orientation, panelHeight, instance_id);
        log("Start VPN Applet");
        this.loopId = 0;
        this.refreshInterval = 5;
        this.appletPath = metadata.path;
        this.appletName = metadata.name;
        this.connected = false;
        this.set_icons();
        this.update_icon();
        this.main_loop();
    }

    set_icons(){
        log("Set Icons");
        this.vpnStatusOffIcon = this.appletPath + "/icons/vpn-status-off.svg";
        log("vpnStatusOffIcon: " + this.vpnStatusOffIcon);
        this.vpnStatusOnIcon = this.appletPath + "/icons/vpn-status-on.svg";
        log("vpnStatusOnIcon: " + this.vpnStatusOnIcon);
    }

    update_icon(){
        log("Update Icons");
        if(this.connected){
            log("Set ON Icon");
            this.set_applet_icon_path(this.vpnStatusOnIcon);
        } else {
            log("Set OFF Icon");
            this.set_applet_icon_path(this.vpnStatusOffIcon);
        }
        log("Icons Updated");
    }

    log(message){
        if(DEBUG){
            global.log(message);
        }
    }

    main_loop() {
        if (this.loopId > 0) {
            Mainloop.source_remove(this.loopId);
        }
        this.loopId = 0;
        let [res, out, err, status] = GLib.spawn_command_line_sync('bash -c \'/usr/bin/nmcli con show --active | /bin/grep -i vpn\'');
        log("out: " + out.toString());
        log("err: " + err.toString());
        this.connected = out.toString() == "" ? false : true;
        this.update_icon();
        this.loopId = Mainloop.timeout_add_seconds(this.refreshInterval, () => this.main_loop());
    }

}

function main(metadata, orientation, panel_height, instance_id) {
    return new VpnStatusApplet(metadata, orientation, panel_height, instance_id);
}
