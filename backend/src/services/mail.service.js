import 'dotenv/config'
import nodemailer from 'nodemailer'

const googleUser = process.env.GOOGLE_USER
const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

if (!googleUser || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Gmail OAuth environment variables. Check GOOGLE_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.')
}

async function createTransporter() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: googleUser,
            clientId,
            clientSecret,
            refreshToken,
        },
    })

    await transporter.verify()
    console.log('Email transporter is ready to send emails')
    return transporter
}

export async function sendEmail({ to, subject, html, text }) {
    const mailOption = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text,
    }

    try {
        const transporter = await createTransporter()
        const details = await transporter.sendMail(mailOption)
        console.log('Email Sent : ', details)
        return details
    } catch (err) {
        console.error('Failed to send email:', err)
        throw err
    }
}
