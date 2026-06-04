import { Flex, Text, Button } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { useState } from 'react'
import { useGetMethods, useUpdateMethod, useDeleteMethod} from '../hooks/method.hooks'
import { X, Pencil, Trash2, CirclePlus, Check} from 'lucide-react'
import type { UserMethods } from '../types'
import { useNavigate } from 'react-router-dom'
import { LoadingComponent } from '../components'

interface methodDisplayProp {
    record: UserMethods,
}

const MethodDisplayComponent = ({record}: methodDisplayProp) => {

    const { user } = useAuth()
    const [editEnabled, setEditEnabled] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")
    const {isPending, mutate: mutateMethod} = useUpdateMethod()
    const {isPending: pendingDelete, mutate: deleteMethod} = useDeleteMethod()

    const handleConfirm = () => {
        const name = newName.trim()
        if (name){
            mutateMethod({"id": record.id, "name": name, "accountID": user?.id || ""})
            setNewName("")
        }
        setNewName("")
        setEditEnabled(false)
    }
    const handleDelete = () => {
        deleteMethod({"id": record.id, "accountID": user?.id || ""})
        setConfirmDelete(false)
    }
    if (isPending){
        return <Text>Updating...</Text>
    }
    if (pendingDelete){
        return <Text>Deleting...</Text>
    }
    return (
        <div className="app-record-card app-record-card--method">
            <div className="app-record-card__content">
            <div className="app-record-card__row">
                <Text className="app-record-card__title">
                    {record.name}
                </Text>
                <div className="app-record-actions">
                    {
                        editEnabled ? 
                        <Check className="app-record-icon" onClick={() => handleConfirm()}/> :

                        confirmDelete ? 
                        <div className="app-record-actions">
                            <X className="app-record-icon" onClick={() => setConfirmDelete(false)}/>
                            <Button className="app-button app-record-delete" onClick={() => handleDelete()}>Delete</Button>
                        </div> : 

                        <div className="app-record-actions">
                        <Pencil className="app-record-icon" onClick={() => setEditEnabled(true)}/>
                        <Trash2 className="app-record-icon" onClick={() => setConfirmDelete(true)}/>                                
                        </div>
                        
                    }
                </div>
            </div>
            { editEnabled && 
                <Flex>
                    <input className="app-input app-input--record app-record-input" value={newName} onChange={(e) => {setNewName(e.target.value)}} />
                </Flex>
            }
            </div>
        </div>
    )

}
export const MethodsPage = () => {

    const {user, loading} = useAuth()

    const {data: userMethods, isPending} = useGetMethods(user?.id || "")

    const navigate = useNavigate();

    if (loading){
        return <LoadingComponent/>
    }

    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">Methods</h1>
                                <p className="app-subtitle">Manage the payment methods attached to your transactions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-content">
                        <p className="app-intro">Welcome to your methods page!</p>
                        <section className="app-section">
                            <div className="app-section__header">
                                <h2 className="app-section__title">User Method List</h2>
                                <button type="button" className="app-icon-button" onClick={() => navigate("/methods/create")}> <CirclePlus /> </button>
                            </div>
                            {isPending ? (
                                <p className="app-form-helper">Loading</p>
                            ) : (
                                <div className="app-list-panel">
                                <div className="app-list">
                                    {userMethods?.data.map((record, index) => (
                                        <div key={index} className="app-list-card">
                                            <MethodDisplayComponent record={record}/>
                                        </div>
                                    ))}
                                </div>
                                </div>
                            )}
                            <div className="app-controls" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
                                <Button className="app-button app-button--subtle" onClick={() => navigate("/dashboard")}>Home</Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
