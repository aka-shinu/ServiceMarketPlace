import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';


async function fetchCpn(code) {
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    if (error){
        return error
    }
    return data
}

export default fetchCpn

