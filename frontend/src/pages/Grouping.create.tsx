import { Text, Button } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { useState } from 'react'
import './transactions.create.css'
import { useCreateGroup } from '../hooks'
import { useNavigate } from 'react-router-dom'
import { LoadingComponent } from '../components'

export const GroupingCreate = () => {

    const {user, loading} = useAuth()

    const {mutate: createGroup, isPending} = useCreateGroup()
    const navigate = useNavigate()

    const [parentName, setParentName] = useState<string>("")
    const [parentError, setParentError] = useState<string | null>(null)

    const onSubmit = () => {
        setParentError(null)
        const name = parentName.trim()
        if (!name) {
            setParentError("Name cannot be empty.")
            return
        }
        const formData = {
            name: name,
            accountID: user?.id || "",
        }
        createGroup(formData)
    }

    if (loading || isPending){
        return <LoadingComponent/>
    }

    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">New Grouping</h1>
                                <p className="app-subtitle">Create a category for sorting transactions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-content">
                        <section className="app-section">
                            <div className="app-form-stack">
                                <input className="app-input app-input--form" placeholder="Name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                                {parentError ? <Text className="app-form-error">{parentError}</Text> : null}
                                <Button className="app-button app-button--primary" onClick={onSubmit}>Create Grouping</Button>
                            </div>
                            <div className="app-controls" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                                <Button className="app-button app-button--subtle" onClick={() => navigate('/groups')}>Back</Button>
                                <Button className="app-button app-button--subtle" onClick={() => navigate('/dashboard')}>Home</Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
