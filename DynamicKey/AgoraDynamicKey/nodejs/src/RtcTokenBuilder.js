const AccessToken = require('../src/AccessToken').AccessToken
const Priviledges = require('../src/AccessToken').priviledges

const Role = {
    // DEPRECATED. Role::ATTENDEE has the same privileges as Role.PUBLISHER.
    ATTENDEE: 0,

    // RECOMMENDED. Use this role for a voice/video call or a live broadcast, if your scenario does not require authentication for [Hosting-in](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#hosting-in).
    PUBLISHER: 1,

    /* Only use this role if your scenario require authentication for [Hosting-in](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#hosting-in).
     * @note In order for this role to take effect, please contact our support team to enable authentication for Hosting-in for you. Otherwise, Role.SUBSCRIBER still has the same privileges as Role.PUBLISHER.
     */
    SUBSCRIBER: 2,

    // DEPRECATED. Role.ADMIN has the same privileges as Role.PUBLISHER.
    ADMIN: 101
}

class RtcTokenBuilder {

    /**
     * Builds an RTC token using an Integer uid.
     * @param {*} appID  The App ID issued to you by Agora.
     * @param {*} appCertificate Certificate of the application that you registered in the Agora Dashboard.
     * @param {*} channelName The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. Supported character scopes are:
     * - The 26 lowercase English letters: a to z.
     * - The 26 uppercase English letters: A to Z.
     * - The 10 digits: 0 to 9.
     * - The space.
     * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param {*} uid User ID. A 32-bit unsigned integer with a value ranging from 1 to (2^32-1).
     * @param {*} role See #userRole.
     * - Role.PUBLISHER; RECOMMENDED. Use this role for a voice/video call or a live broadcast.
     * - Role.SUBSCRIBER: ONLY use this role if your live-broadcast scenario requires authentication for [Hosting-in](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#hosting-in). In order for this role to take effect, please contact our support team to enable authentication for Hosting-in for you. Otherwise, Role_Subscriber still has the same privileges as Role_Publisher.
     * @param {*} privilegeExpiredTs  represented by the number of seconds elapsed since 1/1/1970. If, for example, you want to access the Agora Service within 10 minutes after the token is generated, set expireTimestamp as the current timestamp + 600 (seconds).
     * @return The new Token.
     */
    static buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs) {
        return this.buildTokenWithAccount(appID, appCertificate, channelName, uid, role, privilegeExpiredTs)
    }

    /**
     * Builds an RTC token using an Integer uid.
     * @param {*} appID  The App ID issued to you by Agora.
     * @param {*} appCertificate Certificate of the application that you registered in the Agora Dashboard.
     * @param {*} channelName The unique channel name for the AgoraRTC session in the string format. The string length must be less than 64 bytes. Supported character scopes are:
     * - The 26 lowercase English letters: a to z.
     * - The 26 uppercase English letters: A to Z.
     * - The 10 digits: 0 to 9.
     * - The space.
     * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param {*} account The user account.
     * @param {*} role See #userRole.
     * - Role.PUBLISHER; RECOMMENDED. Use this role for a voice/video call or a live broadcast.
     * - Role.SUBSCRIBER: ONLY use this role if your live-broadcast scenario requires authentication for [Hosting-in](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#hosting-in). In order for this role to take effect, please contact our support team to enable authentication for Hosting-in for you. Otherwise, Role_Subscriber still has the same privileges as Role_Publisher.
     * @param {*} privilegeExpiredTs  represented by the number of seconds elapsed since 1/1/1970. If, for example, you want to access the Agora Service within 10 minutes after the token is generated, set expireTimestamp as the current timestamp + 600 (seconds).
     * @return The new Token.
     */
    static buildTokenWithAccount(appID, appCertificate, channelName, account, role, privilegeExpiredTs) {
        this.key = new AccessToken(appID, appCertificate, channelName, account)
        this.key.addPriviledge(Priviledges.kJoinChannel, privilegeExpiredTs)
        if (role == Role.ATTENDEE ||
            role == Role.PUBLISHER ||
            role == Role.ADMIN) {
            this.key.addPriviledge(Priviledges.kPublishAudioStream, privilegeExpiredTs)
            this.key.addPriviledge(Priviledges.kPublishVideoStream, privilegeExpiredTs)
            this.key.addPriviledge(Priviledges.kPublishDataStream, privilegeExpiredTs)
        }
        return this.key.build();
    }

    /**
     * Generates an RTC token with the specified privilege.
     *
     * This method supports generating a token with the following privileges:
     * - Joining an RTC channel.
     * - Publishing audio in an RTC channel.
     * - Publishing video in an RTC channel.
     * - Publishing data streams in an RTC channel.
     *
     * The privileges for publishing audio, video, and data streams in an RTC channel apply only if you have
     * enabled co-host authentication.
     *
     * A user can have multiple privileges. Each privilege is valid for a maximum of 24 hours.
     * The SDK triggers the onTokenPrivilegeWillExpire and onRequestToken callbacks when the token is about to expire
     * or has expired. The callbacks do not report the specific privilege affected, and you need to maintain
     * the respective timestamp for each privilege in your app logic. After receiving the callback, you need
     * to generate a new token, and then call renewToken to pass the new token to the SDK, or call joinChannel to re-join
     * the channel.
     *
     * @note
     * Agora recommends setting a reasonable timestamp for each privilege according to your scenario.
     * Suppose the expiration timestamp for joining the channel is set earlier than that for publishing audio.
     * When the token for joining the channel expires, the user is immediately kicked off the RTC channel
     * and cannot publish any audio stream, even though the timestamp for publishing audio has not expired.
     *
     * @param appId The App ID of your Agora project.
     * @param appCertificate The App Certificate of your Agora project.
     * @param channelName The unique channel name for the Agora RTC session in string format. The string length must be less than 64 bytes. The channel name may contain the following characters:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param uid The user ID. A 32-bit unsigned integer with a value range from 1 to (232 - 1). It must be unique. Set uid as 0, if you do not want to authenticate the user ID, that is, any uid from the app client can join the channel.
     * @param joinChannelPrivilegeExpiredTs The Unix timestamp when the privilege for joining the channel expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set joinChannelPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes.
     * @param pubAudioPrivilegeExpiredTs The Unix timestamp when the privilege for publishing audio expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubAudioPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubAudioPrivilegeExpiredTs as the current Unix timestamp.
     * @param pubVideoPrivilegeExpiredTs The Unix timestamp when the privilege for publishing video expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubVideoPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubVideoPrivilegeExpiredTs as the current Unix timestamp.
     * @param pubDataStreamPrivilegeExpiredTs The Unix timestamp when the privilege for publishing data streams expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubDataStreamPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubDataStreamPrivilegeExpiredTs as the current Unix timestamp.
     * @return The new Token
     */
    static buildTokenWithUidAndPrivilege(appID, appCertificate, channelName, uid, joinChannelPrivilegeExpiredTs,
                                         pubAudioPrivilegeExpiredTs, pubVideoPrivilegeExpiredTs,
                                         pubDataStreamPrivilegeExpiredTs) {
        return this.BuildTokenWithUserAccountAndPrivilege(appID, appCertificate, channelName, uid,
            joinChannelPrivilegeExpiredTs, pubAudioPrivilegeExpiredTs,
            pubVideoPrivilegeExpiredTs, pubDataStreamPrivilegeExpiredTs)
    }

    /**
     * Generates an RTC token with the specified privilege.
     *
     * This method supports generating a token with the following privileges:
     * - Joining an RTC channel.
     * - Publishing audio in an RTC channel.
     * - Publishing video in an RTC channel.
     * - Publishing data streams in an RTC channel.
     *
     * The privileges for publishing audio, video, and data streams in an RTC channel apply only if you have
     * enabled co-host authentication.
     *
     * A user can have multiple privileges. Each privilege is valid for a maximum of 24 hours.
     * The SDK triggers the onTokenPrivilegeWillExpire and onRequestToken callbacks when the token is about to expire
     * or has expired. The callbacks do not report the specific privilege affected, and you need to maintain
     * the respective timestamp for each privilege in your app logic. After receiving the callback, you need
     * to generate a new token, and then call renewToken to pass the new token to the SDK, or call joinChannel to re-join
     * the channel.
     *
     * @note
     * Agora recommends setting a reasonable timestamp for each privilege according to your scenario.
     * Suppose the expiration timestamp for joining the channel is set earlier than that for publishing audio.
     * When the token for joining the channel expires, the user is immediately kicked off the RTC channel
     * and cannot publish any audio stream, even though the timestamp for publishing audio has not expired.
     *
     * @param appId The App ID of your Agora project.
     * @param appCertificate The App Certificate of your Agora project.
     * @param channelName The unique channel name for the Agora RTC session in string format. The string length must be less than 64 bytes. The channel name may contain the following characters:
     * - All lowercase English letters: a to z.
     * - All uppercase English letters: A to Z.
     * - All numeric characters: 0 to 9.
     * - The space character.
     * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
     * @param userAccount The user account.
     * @param joinChannelPrivilegeExpiredTs The Unix timestamp when the privilege for joining the channel expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set joinChannelPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes.
     * @param pubAudioPrivilegeExpiredTs The Unix timestamp when the privilege for publishing audio expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubAudioPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubAudioPrivilegeExpiredTs as the current Unix timestamp.
     * @param pubVideoPrivilegeExpiredTs The Unix timestamp when the privilege for publishing video expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubVideoPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubVideoPrivilegeExpiredTs as the current Unix timestamp.
     * @param pubDataStreamPrivilegeExpiredTs The Unix timestamp when the privilege for publishing data streams expires, represented
     * by the sum of the current timestamp plus the valid time period of the token. For example, if you set pubDataStreamPrivilegeExpiredTs as the
     * current timestamp plus 600 seconds, the token expires in 10 minutes. If you do not want to enable this privilege,
     * set pubDataStreamPrivilegeExpiredTs as the current Unix timestamp.
     * @return The new Token.
     */
    static BuildTokenWithUserAccountAndPrivilege(appID, appCertificate, channelName, account,
                                                 joinChannelPrivilegeExpiredTs,
                                                 pubAudioPrivilegeExpiredTs, pubVideoPrivilegeExpiredTs,
                                                 pubDataStreamPrivilegeExpiredTs) {
        this.key = new AccessToken(appID, appCertificate, channelName, account)
        this.key.addPriviledge(Priviledges.kJoinChannel, joinChannelPrivilegeExpiredTs)
        this.key.addPriviledge(Priviledges.kPublishAudioStream, pubAudioPrivilegeExpiredTs)
        this.key.addPriviledge(Priviledges.kPublishVideoStream, pubVideoPrivilegeExpiredTs)
        this.key.addPriviledge(Priviledges.kPublishDataStream, pubDataStreamPrivilegeExpiredTs)

        return this.key.build();
    }
}

module.exports.RtcTokenBuilder = RtcTokenBuilder;
module.exports.Role = Role;
