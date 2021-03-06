var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
var weekdays   = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
var today  = new Date()
var months = []

function generateViewsAndSetViewState(eventData) {
  generateCalendar(eventData)
  showCalendarAndHideList()
  generateListView(eventData)
}

function generateCalendar (eventData) {
  generateAllTheMonths(eventData)

  eventData.forEach(function (event) {
    appendEvent(event)
  })

  // Highlight today
  $('#' + formattedDate(today)).removeClass('no-event').addClass('today')
  addMonthMenu()
}

// Display mode event handlers

$(document).on('click', '#show-calendar-view', function(e) {
  showCalendarAndHideList()
})

$(document).on('click', '#show-list-view', function(e) {
  showListAndHideCalendar()
})

// Display mode helpers

function showCalendarAndHideList() {
  $('#calendar-goes-here').show()
  $('#list-view').hide()
  $('#show-calendar-view').attr('disabled', true).addClass('active')
  $('#show-list-view').attr('disabled', false).removeClass('active')
}

function showListAndHideCalendar() {
  $('#calendar-goes-here').hide()
  $('#list-view').show()
  $('#show-calendar-view').attr('disabled', false).removeClass('active')
  $('#show-list-view').attr('disabled', true).addClass('active')
}

function addMonthMenu() {
  $('#calendar-goes-here').prepend('<div id="cal-controls">')
  $('.month-table').each(function(_, table) {
    month = $(table).data('month')
    $('#cal-controls').append('<a class="month-menuitem" data-target="' + month + '" href="#' + month + '">' + month + '</a>')
  })

  $(document).on('click', '.month-menuitem', function(e) {
    $('[data-month]').hide()
    $('[data-month="' + $(this).data('target') + '"]').show()
    $(this).addClass('active').siblings().removeClass('active')
    e.preventDefault()
  })

  // Get current month and click it
  var currentMonth = $('[data-target=' + monthNames[(new Date()).getMonth()] + ']')
  if( currentMonth.length ) {
    currentMonth.click()
  } else {
    $('[data-target]').first().click()
  }
}

function appendEvent( event ) {
  var eventStartDate = new Date(event.startdate)
  var eventEndDate   = new Date(event.enddate)
  var eventElement   = $('<div class="event"><a target="_blank" href="' + event.tickets + '">' + event.name + '</a></div>')

  // Handle multi-days
  if ( eventEndDate.getDate() ) {
    var date         = eventStartDate
    var spacerNumber = $('#' + formattedDate(eventStartDate)).find('.event').length
    eventElement.addClass('multi-days')

    while ( eventEndDate > date ) {
      // If reached end of month, go to first day of the next month
      // Else go to the next day
      if (date == new Date(date.getFullYear(), date.getMonth() + 1, 0)) {
        date == new Date(date.getFullYear(), date.getMonth() + 1, 1)
      } else {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 )
      }

      // Add spacer to line up the event
      var dateElement = $('#' + formattedDate(date))
      var steps = dateElement.find('.event').length
      loopForTimes( spacerNumber - steps, function() {
        dateElement.append('<div class="event spacer">&nbsp;</div>')
      })

      dateElement.removeClass('no-event').append('<div class="event multi-days following-days" title="' + event.name + '"><a target="_blank" href="' + event.tickets + '">' + event.name + '</a></div>')
    }
  }

  $('#' + formattedDate(eventStartDate)).removeClass('no-event').append(eventElement)
}

function generateAllTheMonths( eventData ) {
  var dates = []
  var months = []

  eventData.forEach(function(event) {
    if (event.startdate) dates.push(event.startdate)
    if (event.enddate) dates.push(event.enddate)
  })

  dates.forEach(function (date) {
    date = new Date(date)
    if(months.indexOf(date.getMonth()) < 0) {
      months.push(date.getMonth())
      generateMonthTable(date)
    }
  })
}

function generateMonthTable( date ) {
  var eventMonthName = monthNames[date.getMonth()]
  var monthTable     = $('<table cellspacing=0 class="month-table" data-month="' + eventMonthName + '" id="month-' + date.getMonth() + '"></table>')
  var monthTableBody = monthTable.append('<tbody>')
  // var today          = new Date()
  var endOfToday     = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 00, 00, 00)
  var firstDay       = new Date(date.getFullYear(), date.getMonth(), 1)
  var numberOfDays   = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  var weekDayNumber  = firstDay.getDay()

  $('#calendar-goes-here').append(monthTable)
  monthTable.before('<h2 data-month="' + eventMonthName + '">' + eventMonthName + ' ' + date.getFullYear() + '</h2>')

  // Add month calendar header
  monthTableBody.append('<tr class="header"></tr>')
  var headerRow = monthTableBody.find('.header')
  loopForTimes( 7, function(i) {
    headerRow.append('<td>' + weekdays[i] + '</td>')
  })

  // Add empty days from previous month
  var times = weekDayNumber == 0 ? 6 : weekDayNumber - 1
  loopForTimes( times, function() {
    getFirstAvailableRow(monthTable).append('<td class="empty"></td>')
  })

  // Filling the month with days
  loopForTimes( numberOfDays, function(daynumber) {
    var thisDay = new Date(date.getFullYear(), date.getMonth(), (daynumber + 1))
    var id = formattedDate(thisDay)
    var pastClass = endOfToday > thisDay ? "past" : ""
    getFirstAvailableRow(monthTableBody).append('<td class="no-event ' + pastClass + '" id=' + id + '><div class=day>'+ (daynumber + 1) +'</div></td>')
  })

  // Add empty days from next month
  var lastRow = monthTable.find('tr:last')
  var cellsInLastRow = lastRow.find('td').length
  // Check if this is necessary
  if ( cellsInLastRow < 7 ) {
    loopForTimes( (7 - cellsInLastRow), function() {
      lastRow.append('<td class="empty"></td>')
    })
  }
}

// Because I don't like ot write for()
function loopForTimes( times, callback ) {
  for( var i=0; i < times; i++ ){
    callback(i)
  }
}

// This is handy: getting the first row with available cell space
function getFirstAvailableRow( table ) {
  var row = table.find('tr.days').filter(function(i, thisRow) {
    return ($(thisRow).find('td').length) < 7
  })
  // If no available row, create a new one
  if( row.length == 0 ) {
    table.append('<tr class=days>')
    var row = table.find('tr').last()
  }
  return row
}

// Create an unique date string for cell lookup
function formattedDate( date ) {
  return monthNames[date.getMonth()] + '-' + date.getDate()
}
