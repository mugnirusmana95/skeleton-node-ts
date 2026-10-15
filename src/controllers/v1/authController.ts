import { response } from '~/helpers/responseHelper'

import authService from '~/services/v1/authService'
import { TLoginAuthBody } from '~/validations/v1/authValidation'

export default {
  login: async (req: Req, res: Res) => {
    const data = await authService.login(req.body as TLoginAuthBody)

    const { token, user } = data

    res.cookie('token', `${token.type} ${token.value}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(token.expiredAt),
      path: '/',
    })

    return response(res, {
      status: 200,
      data: user,
      message: 'Success',
    })
  },

  refreshToken: async (req: Req, res: Res) => {
    const data = await authService.refreshToken(req)

    const { token, user } = data

    res.cookie('token', `${token.type} ${token.value}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(token.expiredAt),
      path: '/',
    })

    return response(res, {
      status: 200,
      data: user,
      message: 'Successfully refresh token',
    })
  },

  activationRequest: async (req: Req, res: Res) => {
    const data = await authService.activationRequest(req.body)

    return response(res, {
      status: 200,
      data,
      message: 'Account activation request successful. Please check your email.',
    })
  },

  activationSubmit: async (req: Req, res: Res) => {
    const data = await authService.activationSubmit(req.body)

    return response(res, {
      status: 200,
      data,
      message: 'Your account successfully activated',
    })
  },

  changePasswordRequest: async (req: Req, res: Res) => {
    const data = await authService.changePasswordRequest(req.body)

    return response(res, {
      status: 200,
      data,
      message: 'Account change password request successful. Please check your email.',
    })
  },

  changePasswordSubmit: async (req: Req, res: Res) => {
    const data = await authService.changePasswordSubmit(req.body)

    return response(res, {
      status: 200,
      data,
      message: 'Your password successfully changes',
    })
  },

  logout: async (req: Req, res: Res) => {
    const data = await authService.logout(req)

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response(res, {
      status: 200,
      data,
      message: 'Successfully logout',
    })
  },
}