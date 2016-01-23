function renderList(data) {
  var listByMonths = listEvents(data)

  listByMonths.forEach(function(list, i) {
    var monthName = list[0]
    var events = list[1]

    $("#list-view").append("<h2 class=\"month-name " + i + "\">" + monthName + "</h2>")
    $("#list-view").append("<ul class=\"list " + i + "\"></ul>")

    events.forEach(function(event) {
      var datesString = datesAsHumanReadableString([event.startdate, event.enddate])
      var dateMarkup = "<span class=\"date\">" + datesString + "</span>"
      var eventNameMarkup = getEventNameMarkup(event.name)

      $("#list-view ul." + i).append(
        "<li><div>" +
        dateMarkup + ": " +
        eventNameMarkup +
        "</div><div>" +
        event.location +
        "</div></li>"
      )
    })
  })
}

function listEvents(events) {
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

function removeEventsWithNoStartDate(events) {
  return events.filter(function(event) { return event.startdate })
}

function getEventNameMarkup(eventName) {
  var eventDetails = eventName.split(" @ ")
  var eventType = eventDetails[0]
  var eventTypeMarkup = "<span class=\"type\">"+ eventType + " </span>"

  var eventVenue = eventDetails[1]
  var venueNotKnow = eventVenue == "Looking for venue" ||
    eventVenue == "looking for venue"

  var eventVenueMarkup;

  if (venueNotKnow) {
    eventVenueMarkup = "<span class=\"venue-tbd\">We are currently looking for a venue for this event. <a href=\"mailto:london@codebar.io\"> Please get in touch if you'd like to host.</a></span>"
  } else {
    eventVenueMarkup = "<span class=\"venue\">"+ eventVenue + "</span>"
  }





  return "<span class=\"name\">" +
    eventTypeMarkup +
    eventVenueMarkup +
    "</span>"
}

function datesAsHumanReadableString(dates) {
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
  return date.toLocaleString("en-us", {month: "long" })
}

function convertDateStringsToDates(event) {
  var updatedEvent = event
  updatedEvent.startdate = new Date(event.startdate)
  updatedEvent.enddate = event.enddate.length ? new Date(event.enddate) : ""
  return updatedEvent
}

