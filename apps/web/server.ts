import { createRequestHandler } from '@remix-run/cloudflare';
import * as build from './build';

export default createRequestHandler({ build });
