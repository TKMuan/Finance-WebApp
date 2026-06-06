import { Text, Button} from '@radix-ui/themes'
import { useAuth, useGetGroups, useUpdateGroup, useDeleteGroup } from '../hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Search, Check, Pencil, Trash2, X} from 'lucide-react'
import type { UserGroupings } from '../types'
import { LoadingComponent } from '../components'
// removed unused useQueryClient import

interface groupDisplayProp{
    record: UserGroupings
}
const GroupDisplayComponent = ({record}: groupDisplayProp) => {

    const { user } = useAuth()
    const [editEnabled, setEditEnabled] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")
    const {isPending, mutate: mutateGroup} = useUpdateGroup()
    const {isPending: pendingDelete, mutate: deleteGroup} = useDeleteGroup()

    const handleConfirm = () => {
        const name = newName.trim()
        if (name){
            mutateGroup({"id": record.id, "name": name, "accountID": user?.id || ""})
            setNewName("")
        }
        setNewName("")
        setEditEnabled(false)
    }
    const handleDelete = () => {
        deleteGroup({"id": record.id, "accountID": user?.id || ""})
        setConfirmDelete(false)
    }
    if (isPending){
        return <Text>Updating...</Text>
    }
    if (pendingDelete){
        return <Text>Deleting...</Text>
    }
    return (
        <div className="app-record-card app-record-card--group">
            <div className="app-record-card__content">
            <div className="app-record-card__row">
                <text className="app-record-card__title">
                    {record.name}
                </text>
                <div className="app-record-actions">
                    {
                        editEnabled ? 
                        <Check className="app-record-icon" onClick={() => handleConfirm()}/> :

                        confirmDelete ? 
                        <div className="app-record-actions">
                            <X className="app-record-icon" onClick={() => setConfirmDelete(false)}/>
                            <button className="app-button app-record-delete"  onClick={() => handleDelete()}>Delete</button>
                        </div> : 

                        <div className="app-record-actions">
                        <Pencil className="app-record-icon" onClick={() => setEditEnabled(true)}/>
                        <Trash2 className="app-record-icon" onClick={() => setConfirmDelete(true)}/>                                
                        </div>
                        
                    }
                </div>
            </div>
            { editEnabled && (
                <div>
                    <input className="app-input app-input--record app-record-input" value={newName} onChange={(e) => {setNewName(e.target.value)}} />
                </div>
            )}
            </div>
        </div>
    )

}
export const GroupingPage = () => {
    const {user, loading} = useAuth()
    const [currentPage, setCurrentPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(5)
    const [searchGroup, setSearchGroup] = useState<string>("")
    const {data: groups, isPending, refetch} = useGetGroups(user?.id || "", currentPage, pageSize, searchGroup)

    const navigate = useNavigate()

    useEffect(() => {
        console.log("Groups: ", groups)
    }, [groups])
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
                                <h1 className="app-title">Groupings</h1>
                                <p className="app-subtitle">Organize transactions into reusable categories.</p>
                            </div>
                        </div>
                    </div>

                    <div className="app-content">
                        <p className="app-intro">Welcome to your grouping page!</p>
                        <section className="app-section">
                            <div className="app-section__header">
                                <h2 className="app-section__title">Grouping List</h2>
                            </div>
                            <div className="app-toolbar">
                                <div className="app-toolbar__right app-input-row" style={{ justifyContent: 'flex-start' }}>
                                        <input className="app-input app-input--search" value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)} placeholder="Search groupings" />
                                        <button type="button" className="app-icon-button" onClick={() => refetch()} aria-label="Search groupings">
                                            <Search />
                                        </button>
                                </div>
                            </div>
                            <div className="app-list-panel" style={{marginTop: 16}}>
                                <div className="app-toolbar" style={{ marginTop: 0 }}>
                                    <div className="app-toolbar__right">
                                        <legend>Records:</legend>
                                        <div className="app-toolbar__split-right max-w-24">
                                            <select
                                                className="app-select app-input--full "
                                                value={pageSize}
                                                onChange={(e) => setPageSize(Number.parseInt(e.target.value, 10))}
                                            >
                                                <option value={20}>20</option>
                                                <option value={35}>35</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="app-list">
                                    {groups ? groups.data.map((record) => (
                                        <div key={record.id} id={record.id} className="app-list-card">
                                            <GroupDisplayComponent record={record}/>
                                        </div>
                                    )) : (
                                        <Text>No records</Text>
                                    )}
                                </div>
                            </div>
                            <div className="app-toolbar" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
                                <Button className="app-button app-button--subtle" onClick={() => setCurrentPage(prev => prev - 1)} variant="outline" disabled={currentPage <= 0}>Prev Page</Button>
                                <text>{(groups?.page || 0) + 1}</text>
                                <Button className="app-button app-button--subtle" onClick={() => setCurrentPage(prev => prev + 1)} disabled={groups?.data.length !== pageSize} variant="outline">Next Page</Button>
                            </div>
                            <div className="app-controls" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                                <Button className="app-button app-button--subtle" variant="outline" onClick={() => navigate("/dashboard")}>Home</Button>
                                <Button className="app-button app-button--primary" variant="outline" onClick={() => navigate("/groups/create")}>Create Grouping</Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
