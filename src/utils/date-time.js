function timestampTOddd_dd(_date){
    const dateStr = _date;
    const date = new Date(dateStr);
    const options = { weekday: "short", day: "2-digit" };
    return date.toLocaleDateString("es-ES", options).replace(",", ".");
}



function getAverageTime(hours) {
    if(!hours || !hours?.length > 0) return null
    let totalMinutes = 0;

    for (const _hour of hours) {
        const [h, m] = _hour.split(":").map(Number);
        totalMinutes += h * 60 + m;
    }

    const avgMinutes = Math.round(totalMinutes / hours.length);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;

    return `${String(avgHours).padStart(2, "0")}:${String(avgMins).padStart(2, "0")}`;
}