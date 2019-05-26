import {
  Message,
  DMChannel,
  MessageAttachment,
  Collection,
  TextChannel,
  ReactionEmoji,
  User,
  MessageReaction,
  Collector
} from "discord.js";
import SendMsg, { CmdStatus } from "../utils/sendMsg";
import GuildController from "../controllers/guildController";
import ParseRef from "../utils/parseRef";
import MemeController from "../controllers/memeController";

export default class Meme {
  /**
   * Handles memes to be posted
   *
   * @static
   * @param {Message} msg
   * @param {boolean} attribution If the username should be included
   * @returns {Promise<void>}
   * @memberof Meme
   */
  static async postMeme(msg: Message, attribution: boolean): Promise<void> {
    // TODO allow for multiple guilds #42
    const guildId: string = "557276089869664288";

    // Get guild to post in
    const guild = msg.client.guilds.find(guild => guild.id === guildId);
    const memeChannel = await GuildController.getMemeChannel(guild);

    // Check if memes are disabled
    if (memeChannel == null) {
      // Send error
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.ERROR,
        text:
          "We couldn't post your meme for the guild you specified " +
          "doesn't allow for memes to be posted."
      });
      return;
    }

    // Get attachments
    const dmChannel: DMChannel = msg.channel as DMChannel;
    const attachments: Collection<
      string,
      MessageAttachment
    > = dmChannel.messages.last(2)[0].attachments;

    // log(inspect(dmChannel.lastMessage, null, 2));

    // Check for empty attachments
    if (attachments.size != 1) {
      // Send error
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.ERROR,
        text: "The previous message needs to contain exactly one attachment"
      });
      return;
    }

    // Post meme
    const memeArray = await SendMsg.meme({
      attachment: attachments.first(),
      channel: memeChannel as TextChannel,
      msg,
      attribution
    });

    // Add reactions in order
    await memeArray[0].react("👍");
    await memeArray[0].react("👎");

    // Register meme
    Meme.registerMeme(memeArray); // TODO #58
  }

  /**
   * Registers a meme in the db, and starts watching it immediately
   *
   *
   * @static
   * @param {Message[]} memeArray
   * @memberof Meme
   */
  static registerMeme(memeArray: Message[]): void {
    MemeController.add(memeArray);
    this.watchMeme(memeArray);
  }

  /**
   * Watches a meme in this instance
   *
   * This makes sure that downvotes are tracked and events are processed correctly.
   * This method should be called for every meme to be tracked after each startup.
   *
   * @private
   * @static
   * @param {Message} memeArray
   * @memberof Meme
   */
  static watchMeme(memeArray: Message[]) {
    const downvoteCollector = memeArray[0].createReactionCollector(
      (reaction: ReactionEmoji, user: User) => reaction.name === "👎"
    );
    downvoteCollector.on("collect", this.onDownvote);
  }

  /**
   * Logic for downvote handling
   *
   * @private
   * @static
   * @param {MessageReaction} element
   * @param {Collector<string, MessageReaction>} collector
   * @returns {Promise<void>}
   * @memberof Meme
   */
  private static async onDownvote(
    element: MessageReaction,
    collector: Collector<string, MessageReaction>
  ): Promise<void> {
    const downvoteLimit: number = await GuildController.getDownvoteLimit(
      element.message.guild
    );
    if (collector.collected.size > downvoteLimit) this.onLimitExceeded();
  }

  /**
   * Disables the meme channel of the guild the command (in msg) was sent from
   *
   * @static
   * @param {Message} msg
   * @returns {Promise<void>}
   * @memberof Meme
   */
  static async disableMemeChannel(msg: Message): Promise<void> {
    try {
      await GuildController.disableMemeChannel(msg.guild);
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.SUCCESS,
        text: "We successfully disabled the meme channel."
      });
    } catch (error) {
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.ERROR,
        text: "We couldn't disable the meme channel.\nThat's all we know."
      });
    }
  }

  /**
   * Remove the meme (including the video, if any)
   *
   * @private
   * @static
   * @memberof Meme
   */
  private static onLimitExceeded() {
    // TODO #58
  }

  /**
   * Sets the meme channel to the desired channel in
   * the guild the command (in msg) was sent from
   *
   * @static
   * @param {Message} msg
   * @param {string} memeChannelRef
   * @returns {Promise<void>}
   * @memberof Meme
   */
  static async setMemeChannel(
    msg: Message,
    memeChannelRef: string
  ): Promise<void> {
    try {
      const parsedRef = ParseRef.parseChannelRef(memeChannelRef);
      await GuildController.setMemeChannel(msg.guild, parsedRef);

      SendMsg.cmdRes({
        msg,
        status: CmdStatus.SUCCESS,
        text:
          "We've set the meme channel to #" +
          msg.guild.channels.find(channel => channel.id === parsedRef).name
      });
    } catch (error) {
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.ERROR,
        text: "We couldn't set the meme channel.\nThat's all we know."
      });
    }
  }

  /**
   * Prints the meme channel of the guild the command (in msg) was sent from
   *
   * @static
   * @param {Message} msg
   * @returns {Promise<void>}
   * @memberof Meme
   */
  static async printMemeChannel(msg: Message): Promise<void> {
    try {
      const memeChannel = await GuildController.getMemeChannel(msg.guild);
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.INFO,
        text:
          "The meme channel is " +
          (memeChannel == null ? "disabled." : "set to #" + memeChannel.name)
      });
    } catch (error) {
      SendMsg.cmdRes({
        msg,
        status: CmdStatus.ERROR,
        text: "We couldn't print the meme channel.\nThat's all we know."
      });
    }
  }
}
