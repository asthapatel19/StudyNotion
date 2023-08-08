import React, { useState } from 'react'
import { useSelector } from 'react-redux'

export const ForgotPassword = () => {

    const [emailSent,setEmailSent] = useState(false)
    const [email,setEmail] = useState("")
    const {loading} = useSelector((state)=>state.auth)

  return (
    <div className=''>
        {
            loading ? (

                <div>Loading...</div>

            ) : (
                <div>

                    <h1>
                        {
                            !emailSent ? "Reset your password" : "Check your Email"
                        }
                    </h1>

                    <p>
                        {
                            !emailSent ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
                            : `We have sent the reset email to ${email}`
                        }
                    </p>

                    <form>
                        {
                            !emailSent && (
                                <label>
                                    <p>Email Address*</p>

                                    <input
                                      required
                                      type='email'
                                      name='email'
                                      value={email}
                                      onChange={(e)=>setEmail(e.target.value)}
                                      placeholder='Enter your email address'
                                    />

                                </label>
                            )
                        }
                    </form>

                </div>
            )
        }
    </div>
  )
}
