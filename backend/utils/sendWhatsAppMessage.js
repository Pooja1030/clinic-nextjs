export async function sendWhatsAppMessage(phone, message){
    console.log(`[mock send] Whatsapp to ${phone}: ${message}`);

    const success = true;
    if(success) return {status: "SENT"};
    else return {status: "FAILED"};
}