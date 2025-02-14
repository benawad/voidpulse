import * as adsSdk from "facebook-nodejs-business-sdk";

adsSdk.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);

export const fbAdAccount = new adsSdk.AdAccount(process.env.FB_AD_ACCOUNT_ID);
