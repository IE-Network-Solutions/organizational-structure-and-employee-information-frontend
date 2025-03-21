'use client'
import { useParams } from "next/navigation";

const Invoice = () => {
    const { id } = useParams();
    return (
        <div>
            <h1>Invoice {id}</h1>
        </div>
    )
}

export default Invoice;
