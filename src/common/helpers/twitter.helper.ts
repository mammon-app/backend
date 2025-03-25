import axios, { AxiosRequestConfig } from 'axios';
import { BadRequestException } from '@nestjs/common';
import { TWITTER_BEARER_TOKEN } from 'src/config/env.config';

export class TwitterHelper {
  static async getUserId(username: string) {
    try {
      const url = `https://api.twitter.com/2/users/by/username/${username}`;
      const headers = {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      };
      const requestConfig: AxiosRequestConfig = {
        url,
        method: 'get',
        headers,
      };
      const response = await axios(requestConfig);
      return response.data.data.id;
    } catch (err) {
      throw new BadRequestException(err.response.data.errors[0].message);
    }
  }

  // Function to check if one user follows another
  static async checkIfUserFollowsUser(
    sourceUsername: string,
    targetUsername: string,
  ) {
    try {
      const sourceUserId = await this.getUserId(sourceUsername);
      const targetUserId = await this.getUserId(targetUsername);
      const url = `https://api.twitter.com/2/users/${sourceUserId}/following/${targetUserId}`;
      const headers = {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      };
      const requestConfig: AxiosRequestConfig = {
        url,
        method: 'get',
        headers,
      };
      const response = await axios(requestConfig);
      return response.data.data;
    } catch (err) {
      throw new BadRequestException(err.response.data.errors[0].message);
    }
  }
}
