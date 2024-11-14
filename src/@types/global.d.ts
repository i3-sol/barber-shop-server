interface UserDataObject {
	firstName: string
	lastName: string
	email: string
	password: string
	phoneNumber: string
	birthday: string
	anniversaryDay: string
	gender: string
	referBy: string

	chatSummary?: string

	resetPasswordToken?: string
	resetPasswordExpired?: number
	code?: string

	lasttime?: number
	image?: string
}