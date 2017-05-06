
All possible moves:
http://www.half-real.net/tictactoe/

Some other stats:
http://www.se16.info/hgb/tictactoe.htm

# Faster way to transfer to Workers

ArrayBuffer implements Transferable, which can be used across Workers.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
https://developer.mozilla.org/en-US/docs/Web/API/Transferable

> var array = new Int16Array([0xaa])
> var buffer = array.buffer
> var a2 = new Int16Array( buffer )

> a2
[170]

> var a3 = new Int16Array( buffer )
undefined

> a2
[170]

> a3
[170]
