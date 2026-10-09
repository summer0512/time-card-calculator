# GA4 action events

Production measurement ID: `G-C3W52QVV6K`. Development builds do not send these events. Events that occur before the lazy-loaded GA initialization are buffered and flushed after configuration. Analytics failures do not interrupt user actions.

Every event includes `locale`, `calculator_type`, and `period_type`. Non-calculator account entry points use `none` for the latter two parameters. No names, email addresses, card IDs, share URLs, notes, dates, hours, rates, pay amounts, or raw error messages are included in the custom event parameters.

| Event | Trigger | Extra parameters |
| --- | --- | --- |
| `login_start` | Start Google sign-in | `method=Google`, `entry_point` |
| `login` | Observe an authenticated session after an explicit sign-in attempt | `method=Google`, original `entry_point` |
| `login_error` | Sign-in initiation returns an error or throws | `method=Google`, `entry_point` |
| `time_card_save_start` | Send the save request | `operation=create/update` |
| `time_card_save_success` | Successful save response | `operation=create/update` |
| `time_card_save_error` | Failed save request or response | `operation=create/update` |
| `time_card_export` | Trigger the CSV download | `method=csv` |
| `time_card_print` | Generate the printable report | `method=print` |
| `time_card_share_start` | Click Share in the calculator or My Time Cards | `method=link` |
| `time_card_share_link` | Receive a sharing-link response | `method=link`, `operation=generate` |
| `time_card_share_copy` | Successfully copy the link | `method=clipboard`, `operation=copy` |
| `time_card_share_error` | Generate, copy or stop-sharing fails | `operation=generate/copy/stop` |
| `time_card_share_stop` | Successfully revoke sharing | `operation=stop` |

Login success uses a one-use sessionStorage marker that expires after 30 minutes. Ordinary visits with an existing session do not count as new logins. External OAuth cancellation is not a reliable on-site failure signal, so it does not emit `login_error`. Print and export events measure user actions, not completed printer jobs or files successfully written to disk. A sharing-link response may reuse an existing link; it does not necessarily represent a newly created token.

## GA administration after deployment

Verify events in Realtime or DebugView. Create event-scoped custom dimensions for `locale`, `calculator_type`, `period_type`, `operation`, and `entry_point` to use them in reports. Mark selected successful actions as key events if desired; this is separate from deploying the code. The `login` event and its `method` parameter follow GA4's recommended event convention.

References:
- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://developers.google.com/analytics/devguides/collection/ga4/event-parameters
