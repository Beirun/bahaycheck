import HttpSms from "httpsms";

const client = new HttpSms(process.env.HTTPSMS_API_KEY!);


export const sendSMS = async (phoneNumber: string, content: string) => {

  await client.messages
    .postSend({
      content: content,
      from: "+639329413158",
      encrypted: false,
      to: phoneNumber.startsWith("+639")
        ? phoneNumber
        : phoneNumber.startsWith("09")
        ? `+63${phoneNumber.slice(1)}`
        : `+${phoneNumber}`,
    })
    .then((message) => {
      console.log('message',message.id);
    })
    .catch((err) => {
      console.error('error',err);
    });
};



export function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}