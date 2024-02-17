export class UserDto {
    constructor(model) {
        const { user, token, refreshToken } = model;
        this.user = {
            id: user.id,
            userName: user.userName,
            email: user.email,
            diskSpace: user.diskSpace,
            usedSpace: user.usedSpace,
            avatar: user.avatar || "",
            role: user.role || "USER",
            isActivated: user.isActivated || false,
        };
        this.token = token;
        this.refreshToken = refreshToken;
    }
}
//# sourceMappingURL=user-dto.js.map