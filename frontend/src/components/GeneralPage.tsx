import { Flex, Box, ScrollArea } from '@radix-ui/themes'
import React from 'react';
import '../App.css'

interface GeneralPageProps {
    onThemeChange?: () => void;
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
    footer?: React.ReactNode;
    main?: React.ReactNode;
    transparent?: boolean;
}

export const GeneralPage: React.FC<GeneralPageProps> = (props) => {

    return (
        <Flex className="w-screen" direction='column' align="center" justify="start">
            {/* Header Section */}
            <Box className="w-full"> 
                {props.header ? props.header : null}
            </Box>

            <Flex className="w-full" direction="column">
                {/* Sidebar Section */}
                <ScrollArea type="scroll" radius="medium" scrollbars='vertical'>
                    <Box>
                        {props.sidebar ? props.sidebar : null}
                    </Box>
                </ScrollArea>
                {/* Main Content Section */}
                <ScrollArea type="scroll" radius="medium" scrollbars='vertical'>
                    <Box className="w-full" >
                        {props.main ? props.main : null}
                    </Box>
                </ScrollArea>
            </Flex>
            <Flex className="w-full" direction="column">
                {/* Footer Section */}
                <Box className="w-full" >
                    {/* Footer content goes here */}
                    {props.footer ? props.footer : null}
                </Box>
            </Flex>

        </Flex>
    )
}
