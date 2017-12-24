var socket = io("localhost:8080"), editor, silent;

  $(document).ready(() => {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    editor.$blockScrolling = Infinity;

    editor.getSession().on('change', function(e) {
        if(silent) return;
        socket.emit('newText', {val: editor.getValue(), cursor: editor.selection.getCursor(), e: e});
    });
  });



  socket.on('updateText', function(data) {
    console.log(data);
    silent = true;
    let cursor = editor.selection.getCursor();
    editor.setValue(data.value);

    if(data.cursor !== 0) {
      let modifier = {row: 0, column: 0};
      if((data.e.end.row == cursor.row && data.e.end.column <= cursor.column)) {
        modifier.row = data.e.end.row - data.e.start.row;
        if(data.e.start.row == cursor.row)
          modifier.column = data.e.end.column - data.e.start.column;
      }
      else if(data.e.end.row <= cursor.row)
        modifier.row = data.e.end.row - data.e.start.row;


      if(data.action == "remove") {
        modifier.column = -modifier.column;
        modifier.row = -modifier.row;
      }
      editor.selection.moveTo(cursor.row + modifier.row, cursor.column + modifier.column);
    }
    silent = false;
  });