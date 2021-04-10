function recordEvent(eventName, parameters) {
  window.gtag("event", eventName, {
    ...parameters,
    send_to: "G-XF7G8SENJW",
    time_since_start: (
      (new Date().getTime() - window.performance.timing.navigationStart) /
      1000
    ).toFixed(0),
  });
}

export default recordEvent;
