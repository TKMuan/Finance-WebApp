import { useMemo } from "react";
import {Button, Flex, Grid, Text, DropdownMenu, Box} from "@radix-ui/themes"
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
interface DateObj { 
    year: number, 
    month: number,
    day: number
}
interface DateSelectionProps{
    value: DateObj, onChange: (date: DateObj) => void
}
export const DateSelection = ({ value, onChange }: DateSelectionProps) => {
    const { year, month, day} = value;
    const months = ["January", 'February', "March", "April", "May", "June", "July", "August", 'September', "October", "November", "December"]
    const offsets = useMemo(() => generateMonthGrid(year, month), [year, month]);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="outline">{year} / {month + 1} / {day}</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-full bg-white rounded-md shadow-lg p-2">
                <Flex gap='2' direction='column' className="w-full px-4 py-2 items-center justify-center">
                    <Box className="w-full items-center justify-center">
                        <Button className="select_button" onClick={() => onChange({year: year - 1, month: month, day: day})}> {"<"}</Button>
                        <Text className='px-4'>{year}</Text>
                        <Button className="select_button" onClick={() => onChange({year: year + 1, month: month, day: day})}> {">"}</Button>
                    </Box>
                    <DropdownMenu.Separator className="w-full my-1 border-t" />
                    <Box className="w-full flex content-center justify-center">
                        <Button className="select_button" onClick={() => onChange({year: year, month: month - 1, day: day})} disabled={month === 0}>
                            {"<"}
                        </Button>
                        <Text className='px-4'>{months[month]}</Text>
                        <Button className="select_button" onClick={() => onChange({year: year, month: month + 1, day: day})} disabled={month === 11}>
                            {">"}
                        </Button>
                    </Box>
                    <DropdownMenu.Separator className="w-full my-1 border-t" />
                </Flex>
                <Grid columns={{initial: "7"}}>
                    <Text>Su</Text>
                    <Text>Mo</Text>
                    <Text>Tu</Text>
                    <Text>We</Text>
                    <Text>Th</Text>
                    <Text>Fr</Text>
                    <Text>Sa</Text>
                </Grid>
                <Grid columns={{initial: "7"}}>
                {
                    offsets.map((valueStr) => (
                        <Button className="calendar_button" key={valueStr.trim() ? valueStr : Math.random()} onClick={() => {onChange({year, month, day: parseInt(valueStr)})}}>
                            {valueStr}
                        </Button>
                    ))
                }

                </Grid>

            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}