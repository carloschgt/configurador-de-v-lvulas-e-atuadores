import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TorqueRequest {
  valveSize: number;
  pressureClass: number;
  seatMaterial: string;
}

const TORQUE_COEFFICIENTS: Record<string, number> = {
  'PTFE': 0.12,
  'NYLON': 0.15,
  'METAL': 0.25,
  'STELLITE_6': 0.22,
  '316SS': 0.20,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { valveSize, pressureClass, seatMaterial }: TorqueRequest = await req.json();

    if (!valveSize || !pressureClass || !seatMaterial) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: valveSize, pressureClass, seatMaterial'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const coeff = TORQUE_COEFFICIENTS[seatMaterial] || 0.15;
    const pressureFactor = 0.008;
    const sizeExponent = 2.5;
    const safetyMargin = 1.15;

    const baseTorque = coeff * Math.pow(valveSize, sizeExponent) * (1 + pressureFactor * pressureClass);
    
    const result = {
      minTorque: Math.round(baseTorque * 0.9),
      maxTorque: Math.round(baseTorque * safetyMargin),
      recommended: Math.round(baseTorque),
      unit: 'Nm',
      formula: `T = μ × D^${sizeExponent} × (1 + ${pressureFactor} × P)`,
      parameters: { valveSize, pressureClass, seatMaterial, coefficient: coeff }
    };

    console.log('Torque calculated:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Torque calculation error:', error);
    
    return new Response(JSON.stringify({
      error: 'Calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
