angular.module('goGridDiacritics',[]).factory 'removeDiacritics', ->
  diacritics = [
    base: 'azzz'
    letters: /[ą]/g
  ,
    base: 'zzzz'
    letters: /[żź]/g
  ,
    base: 'szzz'
    letters: /[ś]/g
  ,
    base: 'ezzz'
    letters: /[ę]/g
  ,
    base: 'czzz'
    letters: /[ć]/g
  ,
    base: 'nzzz'
    letters: /[ń]/g
  ,
    base: 'ozzz'
    letters: /[ó]/g
  ,
    base: 'lzzz'
    letters: /[ł]/g
  ]
  (str)->
    i = diacritics.length - 1
    while i >= 0
      str = str.replace(diacritics[i].letters, diacritics[i].base)
      i--
    str
