# Manual Verification Checklist

Use this after automated tests pass.

## Full Session Without Camera

1. Start the app with `bun run dev`.
2. Open the local URL shown by Next.js.
3. Click `Play`.
4. Enter age and choose `Skip Camera`.
5. Complete Chapters 1-9.
6. Confirm the results page loads without errors.
7. Open the researcher dashboard.
8. Confirm the session appears and the report opens.
9. Confirm `Camera Frames` is `0` in the ML Screening Support card.

## Camera-Enabled Session With Consent

1. Use a browser with camera permission support.
2. Click `Play`.
3. Enter age and choose `Allow Camera`.
4. Allow the browser camera permission prompt.
5. Complete at least Chapter 1 Level 1 and Chapter 2 Level 2.
6. Open the researcher report after results are generated.
7. Confirm `Camera Frames` is greater than `0`.
8. Confirm SQLite has camera rows:

```powershell
bun -e "import { Database } from 'bun:sqlite'; const db = new Database('./horizons.db'); console.log(db.query('SELECT id, session_id, task_key, expression_scores FROM camera_frames ORDER BY id DESC LIMIT 10').all());"
```

## Camera Permission Denial

1. Start a session with `Allow Camera`.
2. Deny the browser camera permission prompt.
3. Continue gameplay.
4. Confirm gameplay does not block or crash.
5. Confirm results still generate.

## ML Service Offline

1. Leave `ML_SERVICE_URL` unset or stop the Python service.
2. Complete a session or open results for an existing session.
3. Confirm results load.
4. Confirm the researcher report shows ML status as `Unavailable`.

## ML Service Online

1. Train or provide a model in `ml-service/models/`.
2. Start the sidecar:

```powershell
cd ml-service
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

3. Set `ML_SERVICE_URL=http://localhost:8000`.
4. Generate results.
5. Confirm the researcher report shows ML status as `Available`.

