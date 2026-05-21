import { Flex, Box, Text, TextField, Button, Card, Spinner } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { useState } from 'react'
import './transactions.create.css'
import { useCreateGroup } from '../hooks'
import { useNavigate } from 'react-router-dom'

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
        return <Spinner/>
    }

    return (
        <Box className="w-full p-5">
            <Text>New Grouping</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Flex gap='2' direction='column'>
                <TextField.Root placeholder="Name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                {
                    parentError ? 
                    <Text>{parentError}</Text>
                    : <></>
                }
                <Button onClick={onSubmit}>Create Grouping</Button>
                </Flex>
                <Flex gap='2' className="w-full" mt="2" justify='center'>
                    <Button onClick={() => navigate('/groups')}>
                        Back
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
                        Home
                    </Button>
                </Flex>
            </Card>
        </Box>
    )
}
