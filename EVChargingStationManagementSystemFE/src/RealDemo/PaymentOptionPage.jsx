import React from "react";
import { useParams } from "react-router-dom";
import PaymentOption from "./PaymentOption";

const PaymentOptionPage = () => {
    const { sessionId } = useParams();
    return <PaymentOption sessionId={sessionId} />;
};

export default PaymentOptionPage;


