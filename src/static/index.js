$(document).ready(function() {
  'use strict';

  function leftPad(string, paddingChar, length) {
    if ((string.length < length) && (paddingChar.toString().length > 0))
    {
      for (var i = 0; i < (length - string.length) ; i++)
      string = paddingChar.toString().charAt(0).concat(string);
    }

    return string;
  };

  function formatValue(value) {

    function valToHex(value) {
      return '\\x' + leftPad(value.charCodeAt(0).toString(16), 0, 2);
    }

    value = value
              .replace('\\', '\\\\')
              .replace('\'', '\\\'')
              .replace(/[^\x21-\x7e]/g, valToHex);
    return `'${value}'`;
  }

  function processResults(problemTemplate, resultTemplate, data) {
    let results = $('#results');
    results.empty();

    if (data.warnings) {
      data.warnings.forEach(function(warning) {
        console.log(`Warning [${warning.name}]: ${warning.message}`);
      });
    }

    if (!data.status) {
      results.append(problemTemplate({
        message: 'Something went wrong'
      }));
    } else if (data.status === 'failed') {
      results.append(problemTemplate({
        message: data.error
      }));
    } else if (!data.result.length) {
      results.append(problemTemplate({
        message: 'Can\'t generate any possible values for your regex \xF0\x9F\x98\xA5'
      }));
    } else {
      results.append(resultTemplate({
        values: data.result.map(formatValue)
      }));
    }

    $("#results").fadeTo(100, 1.0);
  }

  function solveRegex(next) {
    let regex = $('#regex').val();
    let danger = $('#danger').val();

    if (!regex)
      return;

    window.history.replaceState('', '', `/?regex=${encodeURIComponent(regex)}&danger=${encodeURIComponent(danger)}`);
    $("#results").fadeTo(100, 0.5);
    let request = $.ajax({
      type: 'POST',
      url: '/gen',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({regex, danger})
    })
      .done(next);
  }


  let problemTemplate = _.template($('#problem-template').html());
  let resultTemplate = _.template($('#result-template').html());

  let solver = solveRegex.bind(null, processResults.bind(null, problemTemplate, resultTemplate));
  $('#regex , #danger').keyup($.debounce(500, solver));
  solver();
});
