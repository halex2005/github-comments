import * as React from 'react'

function CalculateRelativeDate(date: Date): string {
  const oneMinute = 60*1000
  const oneHour = 60*oneMinute
  const oneDay = 24*oneHour
  const oneMonth = 30*oneDay
  const difference = +(new Date()) - +date

  if (difference < oneMinute) {
    return 'just now'
  } else if (difference < oneHour) {
    return Math.floor(difference/oneMinute) + ' minutes ago'
  } else if (difference < oneDay) {
    return Math.floor(difference/oneHour) + ' hours ago'
  } else if (difference < oneMonth) {
    return Math.floor(difference/oneDay) + ' days ago'
  } else {
    return 'on ' + date.toLocaleString()
  }
}

export function RelativeTime({ date }: { date: Date }) {
  return (
    <span data-iso-date={date.toISOString()} title={date.toLocaleString()}>
      {CalculateRelativeDate(date)}
    </span>
  )
}
