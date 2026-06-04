import { Button, SegmentedControl, Callout, Em, Strong, Text} from "@radix-ui/themes"
import { useState } from "react"
import { Info, Share } from "lucide-react"
import { useNavigate } from "react-router-dom"

 export const InfoPage = () => {
    const [mode, setMode] = useState<"android" | 'ios'>('android') 
    const navigate = useNavigate()
    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">About The App</h1>
                                <p className="app-subtitle">What the app does and how to get started quickly.</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-content app-info-grid">
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">Finance-Webapp</p>
                            <p className="app-info-panel__body">Finance-Webapp is a lightweight personal finance management tool to help users track their spending habits. The app features the following key components.</p>
                        </div>
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">Main Dashboard</p>
                            <p className="app-info-panel__body">The main dashboard provides 4 main statistics: your daily spending, monthly spending, yearly spending and net expenditure of each user method.</p>
                        </div>
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">User Methods</p>
                            <p className="app-info-panel__body">The user methods hold information about the method of payment. The user can make as many payment methods as required from the methods creation page and view all created methods on the manage methods page.</p>
                            <Callout.Root my="2">
                                <Callout.Icon>
                                    <Info />
                                </Callout.Icon>
                                <Callout.Text>User needs to create at least one method before transactions can be created.</Callout.Text>
                            </Callout.Root>
                        </div>
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">User Groupings</p>
                            <p className="app-info-panel__body">The user is able to create groups to sort transactions into. Created groups can be managed from the groupings page and transactions can be filtered based on their assigned groups. <Strong>Creation of Group is not necessary for creation of transaction.</Strong></p>
                        </div>
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">Transactions</p>
                            <p className="app-info-panel__body">The user is able to create transaction records with some basic information such as <Em>transaction amount, transaction date, method of payment, type of transaction, and group to categorize the transaction</Em>. The transaction records can then be updated or filtered from the transactions page.</p>
                        </div>
                        <div className="app-info-panel">
                            <p className="app-info-panel__title">Installation on mobile</p>
                            <div className="app-step-list">
                                <Text>For mobile users that want to use the web app from their homescreen follow the following steps:</Text>
                                <SegmentedControl.Root value={mode}>
                                    <SegmentedControl.Item value="android" onClick={() => setMode('android')}>Android</SegmentedControl.Item>
                                    <SegmentedControl.Item value="ios" onClick={() => setMode('ios')}>IOS</SegmentedControl.Item>
                                </SegmentedControl.Root>
                                {mode === 'android' ? (
                                    <div className="app-step-list">
                                        <Text>1. Open chrome and go to the webpage</Text>
                                        <Text>2. On the right of the address bar, tap More and then Add to home screen and then Install.</Text>
                                        <Text>3. Follow the on-screen instructions.</Text>
                                    </div>
                                ) : (
                                    <div className="app-step-list">
                                        <Text>1. Open chrome and go to the webpage</Text>
                                        <Text>2. On the right of the address bar, tap Share <Share /></Text>
                                        <Text>3. Find and tap Add to Home Screen</Text>
                                        <Text>4. Confirm or edit the website details and tap Add</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="app-controls" style={{ justifyContent: 'center' }}>
                            <Button className="app-button app-button--primary" variant="ghost" mb="6" onClick={() => navigate('/auth')}>
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
 }