import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase Storage bucket on startup
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const bucketName = 'make-7e600dc3-uav-images';

// Initialize database and storage on startup
(async () => {
  try {
    // Try to create KV table using direct SQL query
    console.log('Initializing KV table...');
    
    // First, let's try to query the table to see if it exists
    const testQuery = await supabase.from('kv_store_faa4b35a').select('key').limit(1);
    
    if (testQuery.error && testQuery.error.message.includes('does not exist')) {
      console.log('❌ Table kv_store_faa4b35a does not exist!');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚠️  MANUAL ACTION REQUIRED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('Please create the table manually in your Supabase dashboard:');
      console.log('');
      console.log('1. Go to: https://supabase.com/dashboard/project/wuhndvrjxzfkdwdjtzih/editor');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Click "New Query"');
      console.log('4. Paste this SQL and click "Run":');
      console.log('');
      console.log('   CREATE TABLE IF NOT EXISTS kv_store_faa4b35a (');
      console.log('     key TEXT NOT NULL PRIMARY KEY,');
      console.log('     value JSONB NOT NULL');
      console.log('   );');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    } else if (testQuery.error) {
      console.log('Error checking table:', testQuery.error.message);
    } else {
      console.log('✓ KV table exists and is ready');
    }

    // Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
      if (error) {
        console.log(`Bucket creation error: ${error.message}`);
      } else {
        console.log(`✓ Bucket ${bucketName} created successfully`);
      }
    } else {
      console.log(`✓ Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.log(`Error during initialization: ${error}`);
  }
})();

// Health check endpoint
app.get("/make-server-7e600dc3/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all images from the recognize bucket
app.get("/make-server-7e600dc3/recognize-images", async (c) => {
  try {
    console.log('=== Fetching images from recognize bucket ===');
    
    // List all files in the recognize bucket
    const { data: files, error } = await supabase.storage
      .from('recognize')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.log('Error listing files from recognize bucket:', error.message);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!files || files.length === 0) {
      console.log('No files found in recognize bucket');
      return c.json({ success: true, images: [] });
    }

    // Filter by image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const imageFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return imageExtensions.some(ext => fileName.endsWith(ext));
    });

    console.log(`Found ${imageFiles.length} image files out of ${files.length} total files`);

    // Create public URLs for images
    const imagesWithUrls = imageFiles.map((file, index) => {
      const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/recognize/${file.name}`;
      
      return {
        id: String(index + 1),
        name: file.name,
        url: publicUrl,
        timestamp: new Date(file.created_at || Date.now()).toLocaleTimeString('ru-RU'),
        coordinates: '55.7558° N, 37.6173° E', // Default coordinates
        detections: Math.floor(Math.random() * 49) + 1, // Random detections 1-49
        hasDetections: true, // Always has detections
        createdAt: file.created_at,
        size: file.metadata?.size || 0,
      };
    });

    console.log(`=== Returning ${imagesWithUrls.length} images from recognize bucket ===`);
    return c.json({ success: true, images: imagesWithUrls });
  } catch (error) {
    console.log(`Error fetching recognize images: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all snapshots for an inspection
app.get("/make-server-7e600dc3/snapshots/:inspectionId", async (c) => {
  try {
    const inspectionId = c.req.param('inspectionId');
    console.log('=== Fetching snapshots for inspection:', inspectionId);
    const snapshots = await kv.getByPrefix(`snapshot:${inspectionId}:`);
    console.log('Snapshots found:', snapshots.length);
    
    // Create signed URLs for images
    const snapshotsWithUrls = await Promise.all(
      snapshots.map(async (snapshot: any) => {
        if (snapshot.imagePath) {
          const { data: signedUrlData } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(snapshot.imagePath, 3600); // 1 hour expiry
          
          console.log('Created signed URL for:', snapshot.imagePath, !!signedUrlData?.signedUrl);
          return {
            ...snapshot,
            imageUrl: signedUrlData?.signedUrl || null,
          };
        }
        return snapshot;
      })
    );
    
    // Sort snapshots by date in descending order (newest first)
    const sortedSnapshots = snapshotsWithUrls.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    
    console.log('=== Returning', sortedSnapshots.length, 'snapshots ===');
    return c.json({ success: true, snapshots: sortedSnapshots });
  } catch (error) {
    console.log(`Error fetching snapshots: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload a new snapshot
app.post("/make-server-7e600dc3/snapshots", async (c) => {
  try {
    console.log('=== Snapshot upload request received ===');
    const formData = await c.req.formData();
    const inspectionId = formData.get('inspectionId') as string;
    const name = formData.get('name') as string;
    const date = formData.get('date') as string;
    const coordinates = formData.get('coordinates') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;

    console.log('Form data received:', { inspectionId, name, date, coordinates, description, hasImage: !!imageFile });

    if (!inspectionId || !name || !date) {
      console.log('Missing required fields');
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    let imagePath = null;

    // Upload image to Supabase Storage if provided
    if (imageFile && imageFile.size > 0) {
      console.log('Processing image upload:', { fileName: imageFile.name, size: imageFile.size, type: imageFile.type });
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${inspectionId}/${Date.now()}.${fileExt}`;
      
      const fileBuffer = await imageFile.arrayBuffer();
      console.log('File buffer created, size:', fileBuffer.byteLength);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.log(`Image upload error: ${uploadError.message}`, uploadError);
        return c.json({ success: false, error: `Image upload failed: ${uploadError.message}` }, 500);
      }

      imagePath = uploadData.path;
      console.log('Image uploaded successfully to:', imagePath);
    }

    // Save snapshot metadata to KV store
    const snapshotId = `snapshot:${inspectionId}:${Date.now()}`;
    const snapshotData = {
      id: snapshotId,
      inspectionId,
      name,
      date,
      coordinates: coordinates || '',
      description: description || '',
      imagePath,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving snapshot to KV store:', snapshotId);
    await kv.set(snapshotId, snapshotData);
    console.log('Snapshot saved to KV store successfully');

    // Get signed URL for immediate use
    let imageUrl = null;
    if (imagePath) {
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(imagePath, 3600);
      imageUrl = signedUrlData?.signedUrl || null;
      console.log('Signed URL created:', !!imageUrl);
    }

    console.log('=== Snapshot created successfully ===');
    return c.json({ 
      success: true, 
      snapshot: { ...snapshotData, imageUrl } 
    });
  } catch (error) {
    console.log(`Error creating snapshot: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get weed detection stats by image filename
app.get("/make-server-7e600dc3/weed-detection-stats/:imageFileName", async (c) => {
  try {
    const imageFileName = c.req.param('imageFileName');
    console.log('=== Fetching weed detection stats for image:', imageFileName);

    // Query the weed_detection_stats table
    const { data, error } = await supabase
      .from('weed_detection_stats')
      .select('*')
      .eq('image_file_name', imageFileName);

    if (error) {
      console.log('Error querying weed_detection_stats:', error.message);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`Found ${data?.length || 0} detection stats for ${imageFileName}`);
    return c.json({ success: true, stats: data || [] });
  } catch (error) {
    console.log(`Error fetching weed detection stats: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all aggregated weed detection stats (groups by plant_name and sums count)
app.get("/make-server-7e600dc3/weed-stats-all", async (c) => {
  try {
    console.log('=== Fetching all aggregated weed detection stats ===');

    // Query all weed detection stats from the table
    const { data, error } = await supabase
      .from('weed_detection_stats')
      .select('*');

    if (error) {
      console.log('Error querying weed_detection_stats:', error.message);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!data || data.length === 0) {
      console.log('No stats found in weed_detection_stats table');
      return c.json({ success: true, stats: [] });
    }

    console.log(`Found ${data.length} total detection records in database`);

    // Aggregate by plant_name
    const aggregated = new Map();

    data.forEach((stat: any) => {
      const plantName = stat.plant_name || 'Неизвестный сорняк';

      if (aggregated.has(plantName)) {
        const existing = aggregated.get(plantName);
        existing.count += stat.count || 0;
        existing.confidenceSum += stat.confidence || 0;
        existing.confidenceCount += 1;
      } else {
        aggregated.set(plantName, {
          plant_name: plantName,
          count: stat.count || 0,
          confidenceSum: stat.confidence || 0,
          confidenceCount: 1
        });
      }
    });

    // Calculate average confidence for each plant and sort by count descending
    const result = Array.from(aggregated.values())
      .map(item => ({
        plant_name: item.plant_name,
        count: item.count,
        confidence: item.confidenceSum / item.confidenceCount
      }))
      .sort((a, b) => b.count - a.count);

    console.log(`Aggregated into ${result.length} unique plant types:`, result);
    return c.json({ success: true, stats: result });
  } catch (error) {
    console.log(`Error fetching all weed stats: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get aggregated weed detection stats for inspection (groups by plant_name and sums count)
app.get("/make-server-7e600dc3/inspection-stats/:inspectionId", async (c) => {
  try {
    const inspectionId = c.req.param('inspectionId');
    console.log('=== Fetching aggregated stats for inspection:', inspectionId);

    // Query all weed detection stats from the table
    // Note: Since there's no inspection_id column, we get all records and aggregate them
    const { data, error } = await supabase
      .from('weed_detection_stats')
      .select('*');

    if (error) {
      console.log('Error querying weed_detection_stats:', error.message);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!data || data.length === 0) {
      console.log('No stats found in weed_detection_stats table');
      return c.json({ success: true, stats: [] });
    }

    console.log(`Found ${data.length} total detection records in database`);

    // Aggregate by plant_name
    const aggregated = new Map();
    
    data.forEach((stat: any) => {
      const plantName = stat.plant_name || 'Неизвестный сорняк';
      
      if (aggregated.has(plantName)) {
        const existing = aggregated.get(plantName);
        existing.count += stat.count || 0;
        existing.confidenceSum += stat.confidence || 0;
        existing.confidenceCount += 1;
      } else {
        aggregated.set(plantName, {
          plant_name: plantName,
          count: stat.count || 0,
          confidenceSum: stat.confidence || 0,
          confidenceCount: 1
        });
      }
    });

    // Calculate average confidence for each plant
    const result = Array.from(aggregated.values()).map(item => ({
      plant_name: item.plant_name,
      count: item.count,
      confidence: item.confidenceSum / item.confidenceCount
    }));

    console.log(`Aggregated into ${result.length} unique plant types:`, result);
    return c.json({ success: true, stats: result });
  } catch (error) {
    console.log(`Error fetching inspection stats: ${error}`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);