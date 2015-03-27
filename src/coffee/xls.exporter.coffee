angular.module('goGridXLSExporter',[]).service 'XLSExport', ->
  class XLSExport
    constructor: (file_name, columns, data)->
      @file_name = file_name
      @columns = columns
      @data = data


    doExport: ()->
      ws = {}
      columns = []
      # Translate columns provided
      for column, i in @columns
        if column.visible and column.type isnt 'checkbox'
          columns.push
            header: column.header
            index: i
            field: column.name
            template: column.template
            width: column.width

      column_index = 0
      col_ref = []
      for col in columns
        cell_ref = XLSX.utils.encode_cell(c: column_index, r: 0)
        cell =
          v: col.header
          t: 's'
        ws[cell_ref] = cell
        column_index++
        col_ref.push
          wpx: col.width

      ws['!cols'] = col_ref
      row_index = 1
      max_col = 0
      XLSX.SSF._table[50] ||= 'YYYY/MM/DD'
      for item, i in @data
        column_index = 0
        for col in columns
          cell_ref = XLSX.utils.encode_cell(c: column_index, r: row_index)
          cell =
            v: item[col.field]||''
            t: 's'

          if $.isNumeric cell.v
            cell.t = 'n'
          else if moment(item[col.field]).isValid() and item[col.field]?
            cell.t = 'n'
            cell.z = XLSX.SSF._table[50]
            cell.v = (moment(item[col.field]).toDate() - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)

          if col.template and cell.t is 's'
            cell.v = $interpolate(col.template)(item: item).replace(/(<([^>]+)>)/ig,"").trim()
            cell.h = $interpolate(col.template)(item: item)

          ws[cell_ref] = cell

          if column_index > max_col
            max_col = column_index
          column_index++
        row_index++
      ws['!ref'] = XLSX.utils.encode_range(
        s:
          c: 0
          r: 0
        e:
          c: max_col
          r: row_index-1
      )

      ws_name = 'export'

      wb =
        SheetNames: [ws_name]
        Sheets: {}
      wb.Sheets[ws_name] = ws

      wbout = XLSX.write(wb,
        bookType: 'xlsx'
        bookSST: true
        type: 'binary'
      )

      s2ab = (s)->
        buf = new ArrayBuffer(s.length)
        view = new Uint8Array(buf)
        for char, i in s
          view[i] = s.charCodeAt(i) & 0xFF
        buf

      t = s2ab(wbout)
      setTimeout ->
        saveAs(new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "#{moment().format("YYYYMMDDHHmmss")}-#{@file_name}.xlsx")
      , 500
      true
