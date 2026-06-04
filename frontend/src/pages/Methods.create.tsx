import { Text, Button } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import type { CreateMethodInput } from '../types'
import { useEffect, useState } from 'react'
import { useCreateMethod } from '../hooks/method.hooks'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoadingComponent } from '../components'

export const MethodCreate = () => {

    const navigate = useNavigate()

    const {user} = useAuth()
    const [error, setError] = useState<string | null>(null)

    const {mutate: createMethod, isPending} = useCreateMethod()

    const [method, setMethod] = useState<CreateMethodInput>({
        name: "",
        accountID: user?.id || ""
    })

    const updateUser = () => {
        setMethod((prev) => ({...prev, accountID: user?.id || ""}))
    }

    useEffect(() => updateUser, [user])

    const onSubmit = () => {
        setError(null)
        const data = {"name": method.name.trim(), "accountID": method.accountID}
        if (!data.name) 
        {
            setError("Name cannot be empty")
            return
        }
        console.log("Creating method with data: ", data)
        createMethod(data);
    }

    if (isPending){
        return (
            <LoadingComponent/>
        )
    }
    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">New Method</h1>
                                <p className="app-subtitle">Create a reusable payment method for transactions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-content">
                        <section className="app-section">
                            <div className="app-form-stack">
                                <ChevronLeft className="app-icon-button" onClick={() => navigate("/methods")} />
                                <input className="app-input app-input--form" placeholder="Name" value={method.name} onChange={(e) => setMethod({...method, name: e.target.value})}/>
                                {error && <Text className="app-form-error">{error}</Text>}
                                <Button className="app-button app-button--primary" onClick={() => onSubmit()}>Create Method</Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}