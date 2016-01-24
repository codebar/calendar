function generateListView(data) {
  var listByMonths = generateListOfEventsByMont(data)

  listByMonths.forEach(function(list, i) {
    var events = list[1]

    $("#list-view").append(getEventMonthAndYearMarkup(list[0], i))

    $("#list-view").append("<ul class=\"list " + i + "\"></ul>")

    events.forEach(function(event) {
      var dateMarkup = getEventDateMarkup([event.startdate, event.enddate])
      var typeMarkup = getEventTypeMarkup(event.name)
      var venueMarkup = getEventVenueMarkup(event.name)
      var locationMarkup = getEventLocationMarkup(event.location)

      $("#list-view ul." + i).append(
        "<li>" +
          "<div class=\"group\">" +
            "<div class=\"date\">" +
              dateMarkup +
            "</div>" +
            "<div class=\"details\">" +
              typeMarkup +
              venueMarkup +
              locationMarkup +
            "</div>" +
          "</div>" +
        "</li>"
      )
    })
  })
}

function generateListOfEventsByMont(events) {
  var currentMonthInDigits = null
  var currentIndex = null

  return removeEventsWithNoStartDate(events)
    .map(function(event) { return convertDateStringsToDates(event) })
    .reduce(function(ret, event) {
      var eventMonthInDigits = event.startdate.getMonth()

      if (currentMonthInDigits === null || eventMonthInDigits > currentMonthInDigits) {
        currentMonthInDigits = eventMonthInDigits
        ret.push([])
        currentIndex = ret.length - 1
      }

      ret[currentIndex].push(event)
      return ret
    }, [])
    .map(function(eventsByMonth) {
      var monthName = getMonthName(eventsByMonth[0].startdate)
      return [monthName, eventsByMonth]
    })
}

// Markup helpers

function getEventMonthAndYearMarkup(date, index) {
  return "<h2 class=\"month-name " + index + "\">" + date + "</h2>"
}

function getEventDateMarkup(datesArray) {
  var datesString = getDatesAsHumanReadableString(datesArray)
  return "<p>" + datesString + "</p>"
}

function getEventTypeMarkup(eventName) {
  var eventDetails = eventName.split(" @ ")
  var eventType = eventDetails[0]
  return "<p class=\"type\">" + eventType + "</p>"
}

function getEventVenueMarkup(eventName) {
  var eventVenue = eventName.split(" @ ")[1]
  var venueNotKnow = eventVenue == "Looking for venue" ||
    eventVenue == "looking for venue"

  if (venueNotKnow) {
    return "<p>Venue: " +
        "<span class=\"venue venue-tbd\">" +
        "We are currently looking for a venue for this event. " +
        "Please <a href=\"mailto:london@codebar.io\">get in touch</a>  if you'd like to host." +
        "</span>" +
      "</p>"
  }

  return "<p class=\"venue\">Venue: "+ eventVenue + "</p>"
}

function getEventLocationMarkup(location) {
  return "<p class=\"location\">" + location + "</p>"
}

// Date helpers

function removeEventsWithNoStartDate(events) {
  return events.filter(function(event) { return event.startdate })
}

function getDatesAsHumanReadableString(dates) {
  var locale = "en-us" // from README.md specs for date formats

  return dates.filter(Boolean)
    .map(function(date) {
      return new Date(date).toLocaleString(locale, {
        month: "short",
        weekday: "short",
        day: "2-digit"
      })
    })
    .join(" to ")
}

function getMonthName(date) {
  return date.toLocaleString("en-us", {
    month: "long",
    year: "numeric"
  })
}

function convertDateStringsToDates(event) {
  var updatedEvent = event
  updatedEvent.startdate = new Date(event.startdate)
  updatedEvent.enddate = event.enddate.length ? new Date(event.enddate) : ""
  return updatedEvent
}

