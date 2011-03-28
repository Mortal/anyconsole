anyconsole
==========

Usage
-----

First argument is the UNIX socket to listen on. The next arguments are the
command to mask.

For instance, to launch a Minecraft server:

    node anyconsole.js /tmp/minecraft java -jar minecraft_server.jar

Now, to access the stdin and out of the process, open a connection to the UNIX
socket specified. For instance, using netcat wrapped in readline:

    rlwrap nc -U /tmp/minecraft

The last 30 lines of output from the command will be shown immediately, and
output from the process is line-buffered and sent to the UNIX socket clients on
each newline. This is approximately equivalent to

    stdbuf -oL java -jar minecraft_server.jar > minecraft.log 2>&1
    tail -fn 30 minecraft.log

except, of course, that you have access to the stdin of the process as well.
