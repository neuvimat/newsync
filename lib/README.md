# NewSync
The goal of NewSync is to expose a simple, automatic and effective way to track changes made to the application state and then
transfer it back to all clients. Main goal is to track changes with minimal need to alter any existing code and to
minimize data transfers.

**Note:** to see usage examples, refer to the readme.md inside the `/src` (demo app) folder.

## Documentation
Some classes may seem to not be documented. It is because their interface is documented and so
the class inherits the docs from the interface!

If you are using any JetBrains IDE, you may invoke the inherited documentation by selecting
the method and pressing CTRL+Q (default hotkey).

Alternatively, you build the docs by running `npm run docs`. This will create a top level folder `docs` with the
generated HTML documentation. However, there are some limitations to that, as the build tool is not
always able to correctly link the individual components. The quick inspect feature in JetBrains IDE usually understands
the links better than the generated docs.

## Components overview
Below are listed the main key components:
### NewSync instance
The instance itself is the main way to interact with the framework. Configuration of the NewSync instance is done
via configuration of the individual components passed in the constructor.

All interaction with the framework should be done via the NewSync instance, expect the containers, which you can alter
directly without any issues as long as the 'proxy' attribute is used.

Two versions of the instance exist: NewSyncClient and NewSyncServer.

The NewSync instance allows listening to some hardcoded events, available in the object ALIAS, specifically:
```
ALIAS.EVENT_DICTIONARY_UPDATE - triggered when a dicitonary was updated
ALIAS.EVENT_SYNC              - triggered when a new synchronization message was received
ALIAS.EVENT_SYNC_LOW          - triggered when a new low priority synchronization message was received
ALIAS.EVENT_NEW_CONTAINER     - triggered when a new container was added at the server during runtime
```
The events under the ALIAS are represented by strings. In a case when the string would collide with any user defined event
it is possible to alter the string inside the ALIAS to anything.
### Network Drivers
Network drivers are another layer of abstraction between the NewSync and the underlying network connection. It is simple
to create a custom driver, it just needs to implement some basic methods.

It is the NewSync instance that takes care of tracking the clients, but each driver may need some different information
stored for the individual clients. As such, when the NewSync adds a client, the developer passes all the required
arguments to the `NewSync.addClient()` methods, that are then passed to the driver. It is the driver's task to create
a correct Model for the client connection that contains all the information required for the driver to operate.

The developer needs to know what should be passed into the `NewSync.addClient()` method for the specific driver they
chose to use. NewSync then receives the client model back from the driver and stores it. Whenever some data is needed
to be transmitted to the client, the client model is then passed to the driver from the NewSync (this is to keep the 
management completely on the side of NewSync).

**Note:** drivers feature both client and server variants, make sure you use the correct one!
#### Websocket
The Websocket driver requires only the socket generated when a client joins to be passed in the `NewSync.addClient()` method.

It also allows specifying a prefix that will be added before every message sent via the underlying socket. In case 
the websocket is used for other message besides those sent by NewSync. If the Websocket socket is specific only to 
NewSync, you can specify and empty prefix (default is '&').
#### WebRTC
WebRTC driver requires the WRTC connection itself, a data channel for basic traffic and, if it already exists, a data
channel that will be used for low priority traffic to be passed in the `NewSync.addClient()`.

If low priority messages are used but there is no low priority channel specified, the connection will try to automatically
establish one.

### Coders
Coders allow to use any format desired by the developer. It is a simple adapter that requires `pack` and `unpack` method
to be implemented.

By default, a MessagePack coder is present in the NewSync code base.
### LongKeyDictionary
The goal of LongKeyDictionary is to translate long keys into shorter ones for the synchronization messages. Only the
server side version is allowed to create new long->short translation in order to simplify the synchronization and consistency
of different keywords across all clients and the server.

**Note:** there are two versions of the dictionary, server side and client side. Make sure you use the correct one!

## Containers
Containers are the main unit of application state. They can be considered as top-level properties. Any containers
linked to the NewSync instance will be automatically shared and synchronized across all clients.

To alter the state, you have to use either 'proxy' or 'pristine' property exposed by the container. Using the 'proxy'
property will cause some overhead, but will track the changes completely automatically. Changes made to the 'pristine'
property have to be marked manually.

If the application just started, it is safe to set the initial state by the 'pristine' property, saving some overhead
that would be needed for the changes detection.

### Protocol messages
In order to transfer the changes across the clients and server for the container, every container has dedicated
'merges', 'deletes' and 'meta' operations.
#### merges
A simple key-value pairs. The whole object is merged into client state when received.
```
{myValue: 40, nestedObject: {one: 1, two: 2}}
```
#### deletes
Similar to merges, but since we may need to specify multiple keys for level and also the nested paths, a special
property '*' is introduced. It is a list of keys that should be deleted at that particular object.
```
{
    '*': ['someKey']
    nestedObject: {
        '*': ['one']
        two: {
            '*': ['deeplyNestedProperty']
        }
    }
}
```
This message will delete a top level key 'someKey', then key 'one' from 'nestedObject' and 'deeplyNestedProperty' from
`two`.
#### meta
Meta message is very similar to deletes message, except inside the '*' property are stored commands to manipulate the
state in more intricate ways in the specified sequence.

## Custom messages
NewSync is also capable to transfer your own, custom, application data via so called 'events' or 'messages'. Events
emulate socket.io library, and 'messages' a typical Websocket connection.

To see how to use them, refer to the readme.md inside the `/src` (demo app) folder.
