import { Flex, Text, Button, DropdownMenu } from '@radix-ui/themes'
import { useAuth, useGetGroups, useUpdateGroup, useDeleteGroup } from '../hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Search, Check, Pencil, Trash2, X, ChevronDown } from 'lucide-react'
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
                            <Button className="app-button app-record-delete"  onClick={() => handleDelete()}>Delete</Button>
                        </div> : 

                        <div className="app-record-actions">
                        <Pencil className="app-record-icon" onClick={() => setEditEnabled(true)}/>
                        <Trash2 className="app-record-icon" onClick={() => setConfirmDelete(true)}/>                                
                        </div>
                        
                    }
                </div>
            </div>
            { editEnabled && (
                <Flex>
                    <input className="app-input app-input--record app-record-input" value={newName} onChange={(e) => {setNewName(e.target.value)}} />
                </Flex>
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
                                        <Text>Records:</Text>
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger>
                                                <Button className="app-button app-button--subtle" variant='outline'>
                                                    {pageSize}
                                                    <ChevronDown/>
                                                </Button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Item onClick={() => setPageSize(5)}>5</DropdownMenu.Item>
                                                <DropdownMenu.Item onClick={() => setPageSize(10)}>10</DropdownMenu.Item>
                                                <DropdownMenu.Item onClick={() => setPageSize(15)}>15</DropdownMenu.Item>
                                                <DropdownMenu.Item onClick={() => setPageSize(20)}>20</DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
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
                                <Text>{(groups?.page || 0) + 1}</Text>
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
