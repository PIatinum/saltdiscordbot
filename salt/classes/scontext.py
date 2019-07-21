from discord.ext import commands
import discord
import asyncio
import typing

class SContext(commands.Context):
  """
  For typing purposes. This is our customization of the Context
  """
  def __init__(self, **attrs):
    super().__init__(**attrs)

  async def customSend(
    self, content: str = None, *, deletable: bool = false, **kwargs
  ) -> discord.Message:
    """|coro|
    Sends a message to the destination with the content given.
    The content must be a type that can convert to a string through ``str(content)``.
    If the content is set to ``None`` (the default), then the ``embed`` parameter must
    be provided.
    To upload a single file, the ``file`` parameter should be used with a
    single :class:`~discord.File` object. To upload multiple files, the ``files``
    parameter should be used with a :class:`list` of :class:`~discord.File` objects.
    **Specifying both parameters will lead to an exception**.
    If the ``embed`` parameter is provided, it must be of type :class:`~discord.Embed` and
    it must be a rich embed type.
    Parameters
    ------------
    content: :class:`str`
        The content of the message to send.
    tts: :class:`bool`
        Indicates if the message should be sent using text-to-speech.
    embed: :class:`~discord.Embed`
        The rich embed for the content.
    file: :class:`~discord.File`
        The file to upload.
    files: List[:class:`~discord.File`]
        A list of files to upload. Must be a maximum of 10.
    nonce: :class:`int`
        The nonce to use for sending this message. If the message was successfully sent,
        then the message will have a nonce with this value.
    delete_after: :class:`float`
        If provided, the number of seconds to wait in the background
        before deleting the message we just sent. If the deletion fails,
        then it is silently ignored.
    deletable: :class:`bool`
        (Customized, added by Pg) If provided, add a trash can reaction on the message to be
        deleted by the member on click.
    Raises
    --------
    ~discord.HTTPException
        Sending the message failed.
    ~discord.Forbidden
        You do not have the proper permissions to send the message.
    ~discord.InvalidArgument
        The ``files`` list is not of the appropriate size or
        you specified both ``file`` and ``files``.
    Returns
    ---------
    :class:`~discord.Message`
        The message that was sent.
    """
    msg = await super().send(content, **kwargs)
    if (!deletable) return msg
    # TODO