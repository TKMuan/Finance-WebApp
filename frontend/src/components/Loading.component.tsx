import { Flex, Link, Spinner } from "@radix-ui/themes"
import { useNavigate } from "react-router-dom"

export const LoadingComponent = () => {
    const navigate = useNavigate()
    return (
        <Flex className="w-full h-full" mt="8" direction="column" gap="4" align="center" justify="center">
            <Spinner/>
            <Link onClick={() => navigate('/auth', {replace: true})}>Taking too long? Re-direct to auth</Link>
        </Flex>
    )
}