
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwqpocjvvmrnswdmkeew.supabase.co';
const supabaseKey = 'sb_publishable_DQ1cLgtpLlfyyGAbLpzB5Q_lUBZ8_K7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
    console.log("Checking Departments:");
    const { data: depts, error: dErr } = await supabase.from('departments').select('*');
    if (dErr) console.error(dErr);
    else console.table(depts);

    console.log("\nChecking Academic Years:");
    const { data: years, error: yErr } = await supabase.from('academic_years').select('*');
    if (yErr) console.error(yErr);
    else console.table(years);
}

debugData();
