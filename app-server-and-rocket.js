
// Reference needed dependencies.
// !ref: http://meshmoon.data.s3.amazonaws.com/app/lib/class.js, Script
// !ref: http://meshmoon.data.s3.amazonaws.com/app/lib/admino-utils-common-deploy.js, Script

// Include dependency scripts.
engine.IncludeFile("http://meshmoon.data.s3.amazonaws.com/app/lib/class.js");
engine.IncludeFile("http://meshmoon.data.s3.amazonaws.com/app/lib/admino-utils-common-deploy.js");

// Import QtCore for both server and client. Import QtGui only on client.
engine.ImportExtension("qt.core"); 
if (IsClient())
    engine.ImportExtension("qt.gui"); 

// Global variables
var _appInstance            = null;
var _applicationName        = "oulu app test";
var _MSG_INTRODUCTION       = "MSG_Action_Introduction";

// Name the logging channel.
SetLogChannelName(_applicationName);

var Server = Class.extend(
{
    init : function()
    {
        LogInfo("Server started");

        // Client sent entity actions
        me.Action(_MSG_INTRODUCTION).Triggered.connect(this, this.onClientIntroduction);

        // Frame updates
        frame.Updated.connect(this, this.onUpdate);

        // Connect to new clients logging in/out
        server.UserConnected.connect(this, this.onClientConnected);
        server.UserDisconnected.connect(this, this.onClientDisconnected);
    },

    shutDown : function()
    {
        Log("Shutting down");
    },

    onUpdate: function(frametime)
    {
    },

    onClientConnected : function(connId, connection)
    {
        Log("Client #" + connection.id + " connected");
    },

    onClientDisconnected : function(connId, connection)
    {
        Log("Client #" + connection.id + " disconnected");
    },

    onClientIntroduction : function()
    {
        var connection = server.ActionSender();
        if (connection != null)
        {
            Log("Client '" + connection.Property("username") + "' with id #" + connection.id + " is ready");

            // Reply to client with the same Entity Action
            connection.Exec(me, _MSG_INTRODUCTION);
        }
        else
            LogError("onClientIntroduction() null entity action sender!");
    }
});

var Client = Class.extend(
{
    init: function()
    {
        LogInfo("Client started");

        this.initUi();

        // Listen for client/server sent entity actions
        me.Action(_MSG_INTRODUCTION).Triggered.connect(this, this.onServerIntroduction);

        // Introduce client app to the server
        me.Exec(EntityAction.Server, _MSG_INTRODUCTION);
    },

    shutDown : function()
    {
        Log("Shutting down");

        // Clean up any UI created by this application.
        ui.RemoveWidgetFromScene(this.ui.proxy);
        this.ui = null;
    },

    initUi : function()
    {
        var baseCSS = "QLabel { color: white; font-size: 14px; background-color: rgba(8,149,195,210); border: 0px; padding: 25px; }";

        this.ui = {};
        this.ui.welcome = new QLabel("Welcome to the '" + _applicationName + "' application");
        this.ui.welcome.styleSheet = baseCSS;

        this.ui.proxy = ui.AddWidgetToScene(this.ui.welcome);
        this.ui.proxy.windowFlags = Qt.Widget;

        this.ui.welcome.move(25, 25);
        this.ui.welcome.visible = true;
    },

    onServerIntroduction : function()
    {
        Log("Server messaged it is ready");
    }
});

// Script destroy/unload handler. Called automatically 
// by the framework when the application is closed.

function OnScriptDestroyed()
{
    if (_appInstance != null)
    {
        if (typeof _appInstance.shutDown === "function")
            _appInstance.shutDown();
        _appInstance = null;
    }
}

// Initialize client or server instances,
// dependeing where the script is being ran.

if (IsClient())
    _appInstance = new Client();
else
    _appInstance = new Server();

