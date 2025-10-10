import{av as P,aw as _,ax as E,ay as R,az as S,aA as L,aB as x,aC as F,aD as U,aE as $,aF as N,aG as M}from"./Layout.stories-kDaxJsVg.js";import"./jsx-runtime-BTJTZTIL.js";import"./index-ChsGqxH_.js";import"./iframe-DyUDVaki.js";import"../sb-preview/runtime.js";import"./index-CJ_LmFaV.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Card-oKz5vSZ3.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G="type.googleapis.com/google.protobuf.Int64Value",H="type.googleapis.com/google.protobuf.UInt64Value";function v(e,t){const r={};for(const n in e)e.hasOwnProperty(n)&&(r[n]=t(e[n]));return r}function T(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>T(t));if(typeof e=="function"||typeof e=="object")return v(e,t=>T(t));throw new Error("Data cannot be encoded in JSON: "+e)}function g(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case G:case H:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>g(t)):typeof e=="function"||typeof e=="object"?v(e,t=>g(t)):e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class d extends F{constructor(t,r,n){super(`${k}/${t}`,r||""),this.details=n,Object.setPrototypeOf(this,d.prototype)}}function J(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function y(e,t){let r=J(e),n=r,i;try{const o=t&&t.error;if(o){const a=o.status;if(typeof a=="string"){if(!b[a])return new d("internal","internal");r=b[a],n=a}const s=o.message;typeof s=="string"&&(n=s),i=o.details,i!==void 0&&(i=g(i))}}catch{}return r==="ok"?null:new d(r,n,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{constructor(t,r,n,i){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,M(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=r.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||r.get().then(o=>this.auth=o,()=>{}),this.messaging||n.get().then(o=>this.messaging=o,()=>{}),this.appCheck||i==null||i.get().then(o=>this.appCheck=o,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t==null?void 0:t.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const r=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return r.error?null:r.token}return null}async getContext(t){const r=await this.getAuthToken(),n=await this.getMessagingToken(),i=await this.getAppCheckToken(t);return{authToken:r,messagingToken:n,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w="us-central1",q=/^data: (.*?)(?:\n|$)/;function B(e){let t=null;return{promise:new Promise((r,n)=>{t=setTimeout(()=>{n(new d("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class V{constructor(t,r,n,i,o=w,a=(...s)=>fetch(...s)){this.app=t,this.fetchImpl=a,this.emulatorOrigin=null,this.contextProvider=new j(t,r,n,i),this.cancelAllRequests=new Promise(s=>{this.deleteService=()=>Promise.resolve(s())});try{const s=new URL(o);this.customDomain=s.origin+(s.pathname==="/"?"":s.pathname),this.region=w}catch{this.customDomain=null,this.region=o}}_delete(){return this.deleteService()}_url(t){const r=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${r}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${r}.cloudfunctions.net/${t}`}}function X(e,t,r){const n=S(t);e.emulatorOrigin=`http${n?"s":""}://${t}:${r}`,n&&(L(e.emulatorOrigin+"/backends"),x("Functions",!0))}function Y(e,t,r){const n=i=>z(e,t,i,r||{});return n.stream=(i,o)=>Q(e,t,i,o),n}function D(e){return e.emulatorOrigin&&S(e.emulatorOrigin)?"include":void 0}async function K(e,t,r,n,i){r["Content-Type"]="application/json";let o;try{o=await n(e,{method:"POST",body:JSON.stringify(t),headers:r,credentials:D(i)})}catch{return{status:0,json:null}}let a=null;try{a=await o.json()}catch{}return{status:o.status,json:a}}async function I(e,t){const r={},n=await e.contextProvider.getContext(t.limitedUseAppCheckTokens);return n.authToken&&(r.Authorization="Bearer "+n.authToken),n.messagingToken&&(r["Firebase-Instance-ID-Token"]=n.messagingToken),n.appCheckToken!==null&&(r["X-Firebase-AppCheck"]=n.appCheckToken),r}function z(e,t,r,n){const i=e._url(t);return W(e,i,r,n)}async function W(e,t,r,n){r=T(r);const i={data:r},o=await I(e,n),a=n.timeout||7e4,s=B(a),u=await Promise.race([K(t,i,o,e.fetchImpl,e),s.promise,e.cancelAllRequests]);if(s.cancel(),!u)throw new d("cancelled","Firebase Functions instance was deleted.");const l=y(u.status,u.json);if(l)throw l;if(!u.json)throw new d("internal","Response is not valid JSON object.");let c=u.json.data;if(typeof c>"u"&&(c=u.json.result),typeof c>"u")throw new d("internal","Response is missing data field.");return{data:g(c)}}function Q(e,t,r,n){const i=e._url(t);return Z(e,i,r,n||{})}async function Z(e,t,r,n){var p;r=T(r);const i={data:r},o=await I(e,n);o["Content-Type"]="application/json",o.Accept="text/event-stream";let a;try{a=await e.fetchImpl(t,{method:"POST",body:JSON.stringify(i),headers:o,signal:n==null?void 0:n.signal,credentials:D(e)})}catch(f){if(f instanceof Error&&f.name==="AbortError"){const A=new d("cancelled","Request was cancelled.");return{data:Promise.reject(A),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(A)}}}}}}const h=y(0,null);return{data:Promise.reject(h),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(h)}}}}}}let s,u;const l=new Promise((f,h)=>{s=f,u=h});(p=n==null?void 0:n.signal)==null||p.addEventListener("abort",()=>{const f=new d("cancelled","Request was cancelled.");u(f)});const c=a.body.getReader(),m=ee(c,s,u,n==null?void 0:n.signal);return{stream:{[Symbol.asyncIterator](){const f=m.getReader();return{async next(){const{value:h,done:A}=await f.read();return{value:h,done:A}},async return(){return await f.cancel(),{done:!0,value:void 0}}}}},data:l}}function ee(e,t,r,n){const i=(a,s)=>{const u=a.match(q);if(!u)return;const l=u[1];try{const c=JSON.parse(l);if("result"in c){t(g(c.result));return}if("message"in c){s.enqueue(g(c.message));return}if("error"in c){const m=y(0,c);s.error(m),r(m);return}}catch(c){if(c instanceof d){s.error(c),r(c);return}}},o=new TextDecoder;return new ReadableStream({start(a){let s="";return u();async function u(){if(n!=null&&n.aborted){const l=new d("cancelled","Request was cancelled");return a.error(l),r(l),Promise.resolve()}try{const{value:l,done:c}=await e.read();if(c){s.trim()&&i(s.trim(),a),a.close();return}if(n!=null&&n.aborted){const p=new d("cancelled","Request was cancelled");a.error(p),r(p),await e.cancel();return}s+=o.decode(l,{stream:!0});const m=s.split(`
`);s=m.pop()||"";for(const p of m)p.trim()&&i(p.trim(),a);return u()}catch(l){const c=l instanceof d?l:y(0,null);a.error(c),r(c)}}},cancel(){return e.cancel()}})}const C="@firebase/functions",O="0.13.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const te="auth-internal",ne="app-check-internal",re="messaging-internal";function ie(e){const t=(r,{instanceIdentifier:n})=>{const i=r.getProvider("app").getImmediate(),o=r.getProvider(te),a=r.getProvider(re),s=r.getProvider(ne);return new V(i,o,a,s,n)};U(new $(k,t,"PUBLIC").setMultipleInstances(!0)),N(C,O,e),N(C,O,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pe(e=P(),t=w){const n=_(E(e),k).getImmediate({identifier:t}),i=R("functions");return i&&se(n,...i),n}function se(e,t,r){X(E(e),t,r)}function he(e,t,r){return Y(E(e),t,r)}ie();export{d as FunctionsError,se as connectFunctionsEmulator,pe as getFunctions,he as httpsCallable};
