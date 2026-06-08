import { useMemo, type Dispatch, type SetStateAction } from "react";
const generateMonthGrid = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month+1, 0).getDate();
    const grid: (string)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
        grid.push(" ");
    }
    let day = 1
    for (day = 1; day <= totalDays; day++) {
        grid.push(day.toString());
    }
    return grid;
};
export interface DateObj { 
    year: number, 
    month: number,
    day: number
}
interface DateSelectionProps{
    value: Date,
    onChange: Dispatch<SetStateAction<Date>>;
}
export const DateSelection = ({ value, onChange}: DateSelectionProps) => {
    const { year, month, day } = {"year": value.getFullYear(), "month": value.getMonth(), "day": value.getDate()};
    const months = ["January", 'February', "March", "April", "May", "June", "July", "August", 'September', "October", "November", "December"]
    const offsets = useMemo(() => generateMonthGrid(year, month), [year, month]);
    const selectedDateLabel = `${months[month]} ${day}, ${year}`

    const updateDate = (year: number, month: number, day: number) => {
        const newDate = new Date(year, month, day)
        onChange(newDate)
    }

    return (
        <div className="app-date-picker">
            <div className="app-date-menu" role="group" aria-label="Date selection" style={{ position: "static", zIndex: "auto" }}>
                <div className="app-date-menu__selected-date" >{selectedDateLabel}</div>
                <div className="app-date-nav">
                    <div className="app-date-nav__row">
                        <button
                            type="button"
                            className="app-date-nav__button"
                            onClick={() => updateDate(value.getFullYear() - 1, value.getMonth(), value.getDate())}
                            aria-label="Previous year"
                        >
                        </button>
                        <span className="app-date-nav__label">{year}</span>
                        <button
                            type="button"
                            className="app-date-nav__button"
                            onClick={() => updateDate(value.getFullYear() + 1, value.getMonth(), value.getDate())}
                            aria-label="Next year"
                        >
                        </button>
                    </div>
                    <div className="app-date-nav__row">
                        <button
                            type="button"
                            className="app-date-nav__button"
                            onClick={() => updateDate(value.getFullYear(), value.getMonth() - 1, value.getDate())}
                            disabled={month === 0}
                            aria-label="Previous month"
                        >
                            &lt;
                        </button>
                        <span className="app-date-nav__label">{months[month]}</span>
                        <button
                            type="button"
                            className="app-date-nav__button"
                            onClick={() => updateDate(value.getFullYear(), value.getMonth() + 1, value.getDate())}
                            disabled={month === 11}
                            aria-label="Next month"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
                <div className="app-date-divider" />
                <div className="app-date-grid__head">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                </div>
                <div className="app-date-grid">
                    {
                        offsets.map((valueStr, index) => (
                            valueStr.trim() ? (
                                <button
                                    type="button"
                                    className="app-date-grid__day"
                                    key={`${valueStr}-${index}`}
                                    onClick={() => updateDate(year, month, parseInt(valueStr))}
                                >
                                    {valueStr}
                                </button>
                            ) : (
                                <span key={`empty-${index}`} className="app-date-grid__empty" />
                            )
                        ))

                    }

                </div>
            </div>
        </div>
    )
}