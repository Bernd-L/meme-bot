import * as program from "commander";
import { log } from "console";
import { exit, stdout } from "process";

/**
 * This script receives the parameters and does the actual parsing.
 *
 * It runs in a child-process of the bot.
 */

/**
 * Requests init and outputs adminRoleRef
 *
 * @param {string} adminRoleRef The mention of the admin role
 */
function init(adminRoleRef: string) {
  // Write the specified adminRoleRef to stdout
  stdout.write(adminRoleRef);

  // Request init
  exit(2001);
}

function cmdChannel(channelName: string, cmd: any) {
  if (channelName == null) {
    // Request cmd channel to be printed
    exit(3001);
  }

  // Log channel name to be read later
  stdout.write(channelName);

  // Request the removal of the cmd channel
  if (cmd.disable)
  exit(3003);
  
  // Request setting the channel name
  exit(3002);
}

// Admin role
function adminRole(adminRoleRef: string, cmd: any) {
  stdout.write(adminRoleRef);
}

// Start
program
  .version("MemeBot version 0.4.0", "-v, --version")
  .description(
    "MemeBot - Automates and manages meme channels for Discord guilds"
  );

// Cmd-channel
program
  .command("cmd [cmdChannel]")
  .description(
    "Set the cmd channel to [cmdChannel], or get the current cmd channel"
  )
  // .alias("cmd-channel <cmdChannel>")
  .alias("c")
  .option("-d, --disable", "Disable the cmd channel check")
  .action(cmdChannel);

// Init
program
  .command("init <adminRole>")
  .description(
    "Initialize this guild; Sets the cmd channel to the one this command is issued in" +
      ", and the admin role to <adminRole>"
  )
  .alias("i")
  .action(init);

// Set admin role


// Help
program
  .option("-e, --example", "Print examples with the help output")
  .on("--help", function() {
    log("");
    if (program.example) {
      log("Examples:");
      log("");
      log("  mb --version");
      log("  mb -v");
      log("");
      log("  mb --help");
      log("  mb -h");
      log("");
      log("  mb init @AdminRole");
      log("  mb i @AdminRole");
      log("");
      log("  mb cmd #bot-commands");
      log("  mb c #bot-commands");
      log("  mb cmd");
      log("  mb c");
    } else {
      log("  Print examples using --examples -h");
    }
  })

// Parse
program
  .parse(process.argv);

// Print help if no args are defined
if (!program.args.length) program.help();

// Exit the process
exit(4242);
