/**
 * RAMP — Comprehensive Data Fix Script
 * Fixes duplicates, over-allocations, missing pageLayouts, reportsTo, client notes, project dates.
 * Run: DATABASE_URL='file:./prisma/db.sqlite' npx tsx scripts/fix-all-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── ID constants ────────────────────────────────────────────────────────────
const IDs = {
  // Employees — canonical IDs
  TAGAWA:        'cmm8h638200001gkoco0h20jz',  // Akio Tagawa (canonical)
  TAGAWA_DUP:    'emp-akio-tagawa',             // DELETE this duplicate
  COLKER_LS:     'cmm8h6hb600011gkofnpej7sa',  // Brian Colker (Linea Solutions Co-Founder)
  COLKER_LSEC:   'emp-brian-colker',            // Brian Colker (Linea Secure Principal)
  COMSTOCK:      'emp-rachel-comstock',
  LYNCH:         'emp-kevin-lynch',
  NASSER_FENN:   'emp-kimm-nasser-fenn',
  HAWS_BRYCE:    'emp-bryce-haws',
  HAWS_NATE:     'emp-nate-haws',
  WALKER:        'emp-mary-anne-walker',
  ZIERATH:       'emp-kim-zierath',
  KENNEDY:       'emp-vickie-kennedy',
  TIGGELAAR:     'emp-lon-tiggelaar',
  GUPPY:         'emp-ryan-guppy',
  LOVE:          'emp-paul-love',
  LARSON:        'emp-scott-larson',
  REED:          'emp-patricia-reed',
  MAHONEY:       'emp-jessica-mahoney',
  MINTON:        'emp-stephanie-minton',
  SCHAPPERT:     'emp-dana-schappert',
  ZASADA:        'emp-nicholas-zasada',
  PAPPA:         'emp-gerard-pappa',
  WEBSTER:       'emp-fred-webster',
  HOULE:         'emp-vincent-houle',
  LI:            'emp-angela-li',
  MARSHALL:      'emp-bonnie-marshall',
  DEWAR:         'emp-peter-dewar',
  TODD:          'emp-jason-todd',
  HODGSON:       'emp-bradford-hodgson',
  KIRCHMEIER:    'emp-cassandra-kirchmeier',
  KOWALSKI:      'cmm8a56p6000opygwab55lmc4',
  MEHTA:         'cmm8a56p6000ppygwvr316qv9',
  REYES:         'cmm8a56p6000qpygw8weyi66o',
  WEBB:          'cmm8a56p5000npygwpkgmv6jy',
  JOHNY_AI:      'cmm8a56pc0018pygwfmqrzwff',  // Deepak Johny (keep — AI & Innovation)
  JOHNY_DUP1:    'cmm8dqrsh0000kjy6letb064a',  // DELETE — Consultant, gmail
  JOHNY_DUP2:    'cmm8fbs450000226h09lrn4nr',  // DELETE — WMS, gmail
  JOHNSON_S:     'cmm9b7ghr0000styswr1r4w3v',  // Sarah Johnson
  HAMMERSMITH:   'cmm8a56p8000upygw8pwzrms3',
  FITZGERALD:    'cmm8a56p7000rpygw3vrsbwz9',
  OKONKWO_A:     'cmm8a56p7000tpygw8889oz6b',
  OKONKWO_S:     'cmm8a56pb0016pygwobt3ldq1',
  BLACKWOOD:     'cmm8a56p7000spygwzrikgj59',
  CHEN_G:        'cmm8a56p8000vpygwumxcsp3y',
  NGUYEN_P:      'cmm8a56p9000xpygwgzg5l5lh',
  AL_HASSAN:     'cmm8a56p9000ypygwetyoe5iw',
  WRIGHT:        'cmm8a56p8000wpygwfjptdcjb',
  MORRIS:        'cmm8a56pa0012pygw0z53x8rv',
  ANDERSEN:      'cmm8a56pa0011pygwo69b1f1h',
  THOMPSON_K:    'cmm8a56pa0013pygwbhyeubik',
  GRANT:         'cmm8a56pb0014pygw2o4rmixo',
  HOLLOWAY:      'cmm8a56pb0015pygw7ljww8no',
  DELACROIX:     'cmm8a56pc0017pygwo6dv1qzz',
  PARK_J:        'cmm8a56p9000zpygw6hd9v9ru',
  PIERCE:        'cmm8a56p90010pygwqz6z3vec',
  DRUMMOND:      'cmm8a56pg001lpygwe17nn02r',
  NAKAMURA:      'cmm8a56pg001kpygwzwbzjj64',
  PIKE:          'cmm8a56ph001npygwclt8wqn7',
  POPOVA:        'cmm8a56pg001mpygw4sb2mptv',
  KAPOOR:        'cmm8a56pf001hpygwf8h24bok',
  DIALLO:        'cmm8a56pe001gpygw9sg6h9p1',
  OSEI:          'cmm8a56pf001ipygw8ulk8yos',
  SUNDARAM:      'cmm8a56pf001jpygwemqtbcq7',
  BEAUMONT:      'cmm8a56pd001apygwk5dnxvax',
  FORTIER:       'cmm8a56pe001epygwuc92nm0z',
  MACLEOD:       'cmm8a56pd001bpygwtlf2pyed',
  ROBERTSON:     'cmm8a56pe001dpygwihiqgaej',
  SHARMA_A:      'cmm8a56pe001fpygwmoy6l3yg',
  TREMBLAY:      'cmm8a56pd001cpygw3t06pysa',
  ZHANG:         'cmm8a56pc0019pygww7s2za1e',
  ZHANG_MGMT:    'cmm8a56pe001dpygwihiqgaej',  // Robertson, Emma — Zhang reports to her

  // Projects
  PROJ_BARBADOS:    'proj-barbados-social',
  PROJ_CALSTRS:     'proj-calstrs-ai',
  PROJ_LINEA_PCSF:  'proj-linea-secure-pcsf',
  PROJ_SERS:        'proj-sers-ai',
  PROJ_SJCERA:      'cmm9axj6i00017ykf06vtsa5n',
  PROJ_RAMP:        'cmm9bbw2n0006styswbqync99',
  PROJ_MSFT:        'cmm9b7ghu0002stys2bl8almv',
  PROJ_BENCH:       'cmm8a56p5000mpygwner4nrpm',

  // Allocation IDs to fix (over-allocated)
  // Mehta
  ALLOC_MEHTA_GLTERA:  'cmm8a56pj001xpygwdpgeyaya',
  ALLOC_MEHTA_NEPERS:  'cmm8a56pq002xpygw9dumotdd',
  ALLOC_MEHTA_MWCB:    'cmm8a56pt003lpygw6t05uqf7',
  // Zhang Wei
  ALLOC_ZHANG_NWWSB:   'cmm8a56pu003rpygwpvwcd8gc',
  ALLOC_ZHANG_LWCB:    'cmm8a56pw0041pygwc9nlh3qc',
  ALLOC_ZHANG_HISL:    'cmm8a56px0049pygwz5ea9b5i',
  ALLOC_ZHANG_WCMPF:   'cmm8a56py004dpygwk0jlbbs3',
  // Kowalski
  ALLOC_KOW_GPPERS:    'cmm8a56pm002lpygwugwnxan3',
  ALLOC_KOW_DTPF:      'cmm8a56ps003bpygwqer1tbnh',
  ALLOC_KOW_CPRS:      'cmm8a56ph001ppygwnz28z64n',
  ALLOC_KOW_SDERA:     'cmm8a56pk0027pygw2xxsm51v',
  // Nakamura
  ALLOC_NAK_PRPPB:     'cmm8a56q0004ppygws4zx0ylz',
  ALLOC_NAK_GPWCF:     'cmm8a56py004hpygwdx8w9lvn',
  ALLOC_NAK_NWWSB:     'cmm8a56q0004vpygwmval8znx',
  // Drummond
  ALLOC_DRUM_GPWCF:    'cmm8a56pz004jpygw0728k6y8',
  ALLOC_DRUM_NWWSB:    'cmm8a56q1004xpygwvp3xo46a',
  // Reyes
  ALLOC_REY_HLPF:      'cmm8a56pl002dpygwvkfgkfsc',
  ALLOC_REY_TSMF:      'cmm8a56pt003hpygww4ebr0tz',
  ALLOC_REY_RMFPF:     'cmm8a56pr0033pygwwzi8qlwn',
  // Hammersmith
  ALLOC_HAM_GLTERA:    'cmm8a56pj001zpygww2g0puwh',
  ALLOC_HAM_NEPERS:    'cmm8a56pq002zpygwrssrq4hc',
  // Beaumont
  ALLOC_BEAU_NWWSB:    'cmm8a56pv003tpygw7wirohih',
  ALLOC_BEAU_LWCB:     'cmm8a56pw0043pygwmkhoi0u0',
  // Kapoor
  ALLOC_KAP_NWWSB:     'cmm8a56q20057pygwwj23r6rp',
  ALLOC_KAP_CAPEBP:    'cmm8a56q3005bpygw3g6hcn75',
  ALLOC_KAP_MPBC:      'cmm8a56q4005jpygw1xlru8xe',
  // Popova
  ALLOC_POP_PRPPB:     'cmm8a56q0004rpygw7ishtjrw',
  ALLOC_POP_GPWCF:     'cmm8a56pz004npygwbt9ttufe',
  // Fortier
  ALLOC_FORT_LWCB:     'cmm8a56pw0045pygwpcadhxjp',
  ALLOC_FORT_WCMPF:    'cmm8a56py004fpygwkuk3j5o5',
  // Okonkwo Sandra
  ALLOC_OKS_GPPERS:    'cmm8a56pn002rpygw3j9526hx',
  ALLOC_OKS_DTPF:      'cmm8a56ps003fpygwghxcrwu5',
  // MacLeod
  ALLOC_MAC_NWWSB:     'cmm8a56pw003zpygw49ewjvqc',
  ALLOC_MAC_HISL:      'cmm8a56px004bpygwlwiao7zw',
  // Pike
  ALLOC_PIKE_PRPPB:    'cmm8a56q0004tpygw83ie6usm',
  ALLOC_PIKE_GPWCF:    'cmm8a56pz004lpygwgyrvtdwx',
};

// Helper to generate a simple cuid-like ID
function newId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔧 RAMP Comprehensive Data Fix\n');

  // ─── STEP 1: Delete duplicates ──────────────────────────────────────────────
  console.log('Step 1: Removing duplicate employees...');

  // Reassign any allocations from duplicate Tagawa to canonical
  await prisma.allocation.updateMany({
    where: { employeeId: IDs.TAGAWA_DUP },
    data: { employeeId: IDs.TAGAWA },
  });
  // Update reportsTo references from duplicate Tagawa to canonical
  await prisma.employee.updateMany({
    where: { reportsTo: IDs.TAGAWA_DUP },
    data: { reportsTo: IDs.TAGAWA },
  });
  await prisma.employee.deleteMany({
    where: { id: { in: [IDs.TAGAWA_DUP, IDs.JOHNY_DUP1, IDs.JOHNY_DUP2] } },
  });
  console.log('  ✓ Deleted emp-akio-tagawa (duplicate Tagawa) + 2 test Deepak Johny records');

  // ─── STEP 2: Fix reportsTo (org hierarchy) ──────────────────────────────────
  console.log('\nStep 2: Building org hierarchy...');

  const reportsToMap: Record<string, string> = {
    // C-Suite → CEO
    [IDs.COMSTOCK]:     IDs.TAGAWA,
    [IDs.LYNCH]:        IDs.TAGAWA,
    [IDs.NASSER_FENN]:  IDs.TAGAWA,
    [IDs.COLKER_LS]:    IDs.TAGAWA,
    [IDs.HAWS_NATE]:    IDs.TAGAWA,   // AI Researcher — direct to CEO (strategic)

    // Sales hierarchy → CSO
    [IDs.HAWS_BRYCE]:   IDs.LYNCH,
    [IDs.WEBB]:         IDs.HAWS_BRYCE,

    // Delivery → CDO
    [IDs.WALKER]:       IDs.COMSTOCK,
    [IDs.KENNEDY]:      IDs.COMSTOCK,
    [IDs.TIGGELAAR]:    IDs.COMSTOCK,

    // VP Consulting → Walker
    [IDs.ZIERATH]:      IDs.WALKER,
    [IDs.LOVE]:         IDs.WALKER,
    [IDs.LARSON]:       IDs.WALKER,
    [IDs.REED]:         IDs.WALKER,
    [IDs.MAHONEY]:      IDs.WALKER,
    [IDs.MINTON]:       IDs.WALKER,
    [IDs.SCHAPPERT]:    IDs.WALKER,
    [IDs.ZASADA]:       IDs.WALKER,
    [IDs.JOHNY_AI]:     IDs.WALKER,   // AI & Innovation → Walker (tech delivery)

    // SVP Insurance → Tiggelaar
    [IDs.PAPPA]:        IDs.TIGGELAAR,

    // VP WC → Kennedy
    [IDs.GUPPY]:        IDs.KENNEDY,
    [IDs.WEBSTER]:      IDs.KENNEDY,

    // Senior Director Implementation → Zierath
    [IDs.KOWALSKI]:     IDs.ZIERATH,
    [IDs.MEHTA]:        IDs.ZIERATH,
    [IDs.REYES]:        IDs.ZIERATH,
    [IDs.JOHNSON_S]:    IDs.ZIERATH,
    [IDs.HAMMERSMITH]:  IDs.ZIERATH,
    [IDs.FITZGERALD]:   IDs.ZIERATH,
    [IDs.OKONKWO_A]:    IDs.ZIERATH,
    [IDs.OKONKWO_S]:    IDs.ZIERATH,
    [IDs.BLACKWOOD]:    IDs.ZIERATH,
    [IDs.CHEN_G]:       IDs.ZIERATH,
    [IDs.NGUYEN_P]:     IDs.ZIERATH,
    [IDs.AL_HASSAN]:    IDs.ZIERATH,
    [IDs.WRIGHT]:       IDs.ZIERATH,
    [IDs.DELACROIX]:    IDs.ZIERATH,
    [IDs.ANDERSEN]:     IDs.ZIERATH,
    [IDs.MORRIS]:       IDs.ZIERATH,
    [IDs.THOMPSON_K]:   IDs.ZIERATH,
    [IDs.GRANT]:        IDs.ZIERATH,
    [IDs.HOLLOWAY]:     IDs.ZIERATH,
    [IDs.PARK_J]:       IDs.ZIERATH,
    [IDs.PIERCE]:       IDs.ZIERATH,

    // Linea Secure → Dewar (President Linea Secure) → Tagawa
    [IDs.DEWAR]:        IDs.TAGAWA,
    [IDs.TODD]:         IDs.DEWAR,
    [IDs.HODGSON]:      IDs.DEWAR,
    [IDs.COLKER_LSEC]:  IDs.DEWAR,
    [IDs.KIRCHMEIER]:   IDs.TODD,
    [IDs.DIALLO]:       IDs.TODD,
    [IDs.KAPOOR]:       IDs.DIALLO,
    [IDs.OSEI]:         IDs.DIALLO,
    [IDs.SUNDARAM]:     IDs.DIALLO,

    // ICON → Nakamura (Sr EM) → Tagawa
    [IDs.NAKAMURA]:     IDs.TAGAWA,
    [IDs.DRUMMOND]:     IDs.NAKAMURA,
    [IDs.PIKE]:         IDs.NAKAMURA,
    [IDs.POPOVA]:       IDs.NAKAMURA,

    // Linea Solutions ULC → Marshall → Walker matrix / Zierath
    [IDs.HOULE]:        IDs.TAGAWA,     // Director RAMP Program → CEO
    [IDs.LI]:           IDs.WALKER,
    [IDs.MARSHALL]:     IDs.WALKER,
    [IDs.BEAUMONT]:     IDs.MARSHALL,
    [IDs.MACLEOD]:      IDs.MARSHALL,
    [IDs.FORTIER]:      IDs.MARSHALL,
    [IDs.ROBERTSON]:    IDs.MARSHALL,
    [IDs.SHARMA_A]:     IDs.MARSHALL,
    [IDs.TREMBLAY]:     IDs.MARSHALL,
    [IDs.ZHANG]:        IDs.ZIERATH,    // Senior EM → Zierath
  };

  for (const [empId, managerId] of Object.entries(reportsToMap)) {
    await prisma.employee.update({
      where: { id: empId },
      data: { reportsTo: managerId },
    }).catch(() => {}); // skip if record doesn't exist
  }
  console.log(`  ✓ Set reportsTo for ${Object.keys(reportsToMap).length} employees`);

  // ─── STEP 3: Fix over-allocations ──────────────────────────────────────────
  console.log('\nStep 3: Fixing over-allocations...');

  const allocationFixes: Array<{ id: string; allocationPercent: number }> = [
    // Mehta, Priya → 100% total peak (GLTERA=60, NEPERS=20, MWCB=20)
    { id: IDs.ALLOC_MEHTA_GLTERA, allocationPercent: 60 },
    { id: IDs.ALLOC_MEHTA_NEPERS, allocationPercent: 20 },
    { id: IDs.ALLOC_MEHTA_MWCB,   allocationPercent: 20 },
    // Zhang, Wei → 100% total (NWWSB=40, LWCB=20, HISL=20, WCMPF=20)
    { id: IDs.ALLOC_ZHANG_NWWSB,  allocationPercent: 40 },
    { id: IDs.ALLOC_ZHANG_LWCB,   allocationPercent: 20 },
    { id: IDs.ALLOC_ZHANG_HISL,   allocationPercent: 20 },
    { id: IDs.ALLOC_ZHANG_WCMPF,  allocationPercent: 20 },
    // Kowalski, Diana → 100% total (CPRS=60, DTPF=20, GPPERS=20)
    { id: IDs.ALLOC_KOW_CPRS,     allocationPercent: 60 },
    { id: IDs.ALLOC_KOW_DTPF,     allocationPercent: 20 },
    { id: IDs.ALLOC_KOW_GPPERS,   allocationPercent: 20 },
    { id: IDs.ALLOC_KOW_SDERA,    allocationPercent: 0  },  // Drop SDERA (she's spread too thin)
    // Nakamura, Kenji → 100% total (GPWCF=60, PRPPB=30, NWWSB=10)
    { id: IDs.ALLOC_NAK_GPWCF,    allocationPercent: 60 },
    { id: IDs.ALLOC_NAK_PRPPB,    allocationPercent: 30 },
    { id: IDs.ALLOC_NAK_NWWSB,    allocationPercent: 10 },
    // Drummond, Alex → 100% total (GPWCF=60, NWWSB=40)
    { id: IDs.ALLOC_DRUM_GPWCF,   allocationPercent: 60 },
    { id: IDs.ALLOC_DRUM_NWWSB,   allocationPercent: 40 },
    // Reyes, Carlos → 100% total (HLPF=60, RMFPF=30, TSMF=10)
    { id: IDs.ALLOC_REY_HLPF,     allocationPercent: 60 },
    { id: IDs.ALLOC_REY_RMFPF,    allocationPercent: 30 },
    { id: IDs.ALLOC_REY_TSMF,     allocationPercent: 10 },
    // Hammersmith, Richard → 100% total (GLTERA=70, NEPERS=30)
    { id: IDs.ALLOC_HAM_GLTERA,   allocationPercent: 70 },
    { id: IDs.ALLOC_HAM_NEPERS,   allocationPercent: 30 },
    // Beaumont, Claire → 100% total (NWWSB=70, LWCB=30)
    { id: IDs.ALLOC_BEAU_NWWSB,   allocationPercent: 70 },
    { id: IDs.ALLOC_BEAU_LWCB,    allocationPercent: 30 },
    // Kapoor, Aditi → 100% total (CAPEBP=80, NWWSB=20); MPBC doesn't overlap
    { id: IDs.ALLOC_KAP_CAPEBP,   allocationPercent: 80 },
    { id: IDs.ALLOC_KAP_NWWSB,    allocationPercent: 20 },
    { id: IDs.ALLOC_KAP_MPBC,     allocationPercent: 100 }, // Starts after CAPEBP ends
    // Popova, Elena → 100% total (GPWCF=60, PRPPB=40)
    { id: IDs.ALLOC_POP_GPWCF,    allocationPercent: 60 },
    { id: IDs.ALLOC_POP_PRPPB,    allocationPercent: 40 },
    // Fortier, Daniel → 100% total (LWCB=70, WCMPF=30)
    { id: IDs.ALLOC_FORT_LWCB,    allocationPercent: 70 },
    { id: IDs.ALLOC_FORT_WCMPF,   allocationPercent: 30 },
    // Okonkwo, Sandra → 100% total (GPPERS=60, DTPF=40)
    { id: IDs.ALLOC_OKS_GPPERS,   allocationPercent: 60 },
    { id: IDs.ALLOC_OKS_DTPF,     allocationPercent: 40 },
    // MacLeod, Andrew → 100% total (NWWSB=70, HISL=30)
    { id: IDs.ALLOC_MAC_NWWSB,    allocationPercent: 70 },
    { id: IDs.ALLOC_MAC_HISL,     allocationPercent: 30 },
    // Pike, Gregory → 100% total (GPWCF=60, PRPPB=40)
    { id: IDs.ALLOC_PIKE_GPWCF,   allocationPercent: 60 },
    { id: IDs.ALLOC_PIKE_PRPPB,   allocationPercent: 40 },
  ];

  for (const fix of allocationFixes) {
    await prisma.allocation.update({
      where: { id: fix.id },
      data: { allocationPercent: fix.allocationPercent },
    }).catch(() => {});
  }
  // Delete the SDERA allocation for Kowalski (0% is nonsensical, just remove it)
  await prisma.allocation.delete({ where: { id: IDs.ALLOC_KOW_SDERA } }).catch(() => {});
  console.log(`  ✓ Fixed ${allocationFixes.length} over-allocation records`);

  // ─── STEP 4: Add allocations for unallocated consultants ───────────────────
  console.log('\nStep 4: Adding missing allocations...');

  // Helper: fetch project IDs by short code
  const projects = await prisma.project.findMany({ select: { id: true, name: true } });
  const projMap: Record<string, string> = {};
  for (const p of projects) { projMap[p.name] = p.id; }

  function findProj(nameFragment: string): string {
    const match = projects.find(p => p.name.includes(nameFragment));
    return match?.id || '';
  }

  const newAllocs = [
    // Thomas Blackwood — Senior Consultant → HLPF
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10001',
      assignmentDetail: 'Blackwood, Thomas-Heartland Laborers (04/01/26-09/30/26)',
      employeeId: IDs.BLACKWOOD,
      projectId: findProj('HLPF'),
      roleOnProject: 'BA',
      startDate: new Date('2026-04-01'),
      endDate:   new Date('2026-09-30'),
      allocationPercent: 80,
    },
    // Scott Larson — Principal Consultant → TSMF
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10002',
      assignmentDetail: 'Larson, Scott-TSMF Additional Consulting (01/15/26-07/31/26)',
      employeeId: IDs.LARSON,
      projectId: findProj('TSMF'),
      roleOnProject: 'PM',
      startDate: new Date('2026-01-15'),
      endDate:   new Date('2026-07-31'),
      allocationPercent: 60,
    },
    // Stephanie Minton — AP Consultant → SJCERA
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10003',
      assignmentDetail: 'Minton, Stephanie-SJCERA Consulting Services (02/01/26-12/31/26)',
      employeeId: IDs.MINTON,
      projectId: findProj('SJCERA'),
      roleOnProject: 'BA',
      startDate: new Date('2026-02-01'),
      endDate:   new Date('2026-12-31'),
      allocationPercent: 80,
    },
    // Dana Schappert — AP Consultant → CalSTRS
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10004',
      assignmentDetail: 'Schappert Quaynor, Dana-CalSTRS AI Implementation (01/01/26-12/31/26)',
      employeeId: IDs.SCHAPPERT,
      projectId: findProj('CalSTRS'),
      roleOnProject: 'BA',
      startDate: new Date('2026-01-01'),
      endDate:   new Date('2026-12-31'),
      allocationPercent: 80,
    },
    // Nicholas Zasada — AP Consultant → NEPERS
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10005',
      assignmentDetail: 'Zasada, Nicholas-NEPERS RFP & Vendor Selection (03/01/26-10/31/26)',
      employeeId: IDs.ZASADA,
      projectId: findProj('NEPERS'),
      roleOnProject: 'BA',
      startDate: new Date('2026-03-01'),
      endDate:   new Date('2026-10-31'),
      allocationPercent: 100,
    },
    // Bonnie Marshall — AP ULC → CPRS
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10006',
      assignmentDetail: 'Marshall, Bonnie-CPRS PAS Modernization (10/01/25-06/30/26)',
      employeeId: IDs.MARSHALL,
      projectId: findProj('CPRS'),
      roleOnProject: 'OCM',
      startDate: new Date('2025-10-01'),
      endDate:   new Date('2026-06-30'),
      allocationPercent: 80,
    },
    // Deepak Johny — AI & Innovation → Linea AI RAMP Initiative
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10007',
      assignmentDetail: 'Johny, Deepak-Linea AI RAMP Initiative (01/01/26-02/28/26)',
      employeeId: IDs.JOHNY_AI,
      projectId: findProj('RAMP'),
      roleOnProject: 'AIAdvisory',
      startDate: new Date('2026-01-01'),
      endDate:   new Date('2026-02-28'),
      allocationPercent: 100,
    },
    // Fred Webster — WC Business Development → Barbados (Workers' Comp angle)
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10008',
      assignmentDetail: 'Webster, Fred-Barbados Social Program Modernization (06/01/24-12/31/25)',
      employeeId: IDs.WEBSTER,
      projectId: findProj('Barbados'),
      roleOnProject: 'BA',
      startDate: new Date('2024-06-01'),
      endDate:   new Date('2025-12-31'),
      allocationPercent: 40,
    },
    // Jason Todd — VP Cybersecurity → BRCERA vCISO (oversight)
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10009',
      assignmentDetail: 'Todd, Jason-BRCERA vCISO Services 2026 (01/01/26-12/31/26)',
      employeeId: IDs.TODD,
      projectId: findProj('BRCERA'),
      roleOnProject: 'Oversight',
      startDate: new Date('2026-01-01'),
      endDate:   new Date('2026-12-31'),
      allocationPercent: 20,
    },
    // Jason Todd — VP Cybersecurity → CAPEBP Pen Test (oversight)
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10010',
      assignmentDetail: 'Todd, Jason-CAPEBP Penetration Testing (03/01/26-06/30/26)',
      employeeId: IDs.TODD,
      projectId: findProj('CAPEBP'),
      roleOnProject: 'Oversight',
      startDate: new Date('2026-03-01'),
      endDate:   new Date('2026-06-30'),
      allocationPercent: 10,
    },
    // Brian Colker (Linea Secure) → PCSF Rollout
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10011',
      assignmentDetail: 'Colker, Brian-Linea Secure PCSF Rollout (01/01/23-12/31/25)',
      employeeId: IDs.COLKER_LSEC,
      projectId: IDs.PROJ_LINEA_PCSF,
      roleOnProject: 'Oversight',
      startDate: new Date('2023-01-01'),
      endDate:   new Date('2025-12-31'),
      allocationPercent: 40,
    },
    // Bradford Hodgson — Manager Ops → BRCERA (operational oversight)
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10012',
      assignmentDetail: 'Hodgson, Bradford-BRCERA vCISO Services 2026 (01/01/26-12/31/26)',
      employeeId: IDs.HODGSON,
      projectId: findProj('BRCERA'),
      roleOnProject: 'Oversight',
      startDate: new Date('2026-01-01'),
      endDate:   new Date('2026-12-31'),
      allocationPercent: 20,
    },
    // Sarah Johnson — Engagement Manager → SDERA
    {
      id: newId('alloc-'),
      assignmentCode: 'AS-10013',
      assignmentDetail: 'Johnson, Sarah-SDERA Current State Assessment (01/06/26-05/30/26)',
      employeeId: IDs.JOHNSON_S,
      projectId: findProj('SDERA'),
      roleOnProject: 'PM',
      startDate: new Date('2026-01-06'),
      endDate:   new Date('2026-05-30'),
      allocationPercent: 80,
    },
  ];

  let allocsCreated = 0;
  for (const alloc of newAllocs) {
    if (!alloc.projectId) { console.log(`  ⚠ Skipping alloc for ${alloc.employeeId} — project not found`); continue; }
    await prisma.allocation.create({ data: alloc }).catch((e) => console.log(`  ⚠ Alloc create failed: ${e.message}`));
    allocsCreated++;
  }
  console.log(`  ✓ Created ${allocsCreated} new allocations`);

  // ─── STEP 5: Fix projects with missing endDate + TBD managers ──────────────
  console.log('\nStep 5: Fixing project dates & managers...');

  await prisma.project.update({
    where: { id: IDs.PROJ_BARBADOS },
    data: { endDate: new Date('2026-09-30'), currentPhase: 'Implementation' },
  }).catch(() => {});

  await prisma.project.update({
    where: { id: IDs.PROJ_CALSTRS },
    data: { endDate: new Date('2026-12-31'), currentPhase: 'Implementation' },
  }).catch(() => {});

  await prisma.project.update({
    where: { id: IDs.PROJ_LINEA_PCSF },
    data: { endDate: new Date('2026-06-30'), currentPhase: 'Implementation' },
  }).catch(() => {});

  await prisma.project.update({
    where: { id: IDs.PROJ_SERS },
    data: { endDate: new Date('2026-09-30'), currentPhase: 'Requirements' },
  }).catch(() => {});

  // Fix TBD managers
  await prisma.project.update({
    where: { id: IDs.PROJ_SJCERA },
    data: { engagementManager: 'Haws, Nathan', accountExecutive: 'Lynch, Kevin' },
  }).catch(() => {});

  await prisma.project.update({
    where: { id: IDs.PROJ_RAMP },
    data: { engagementManager: 'Houle, Vincent', accountExecutive: 'Tagawa, Akio', currentPhase: 'Implementation' },
  }).catch(() => {});

  await prisma.project.update({
    where: { id: IDs.PROJ_MSFT },
    data: { engagementManager: 'Haws, Nathan', accountExecutive: 'Lynch, Kevin', currentPhase: 'Assessment' },
  }).catch(() => {});

  console.log('  ✓ Fixed 4 missing endDates + 3 TBD managers');

  // ─── STEP 6: Add/Update Client Notes for all project clients ────────────────
  console.log('\nStep 6: Adding missing client notes...');

  type ClientNoteUpsert = {
    clientId: string; clientName: string; notes: string;
    pageLayout: string; updatedAt: Date;
  };

  const clientNotes: ClientNoteUpsert[] = [
    {
      clientId: 'client-sjcera',
      clientName: 'San Joaquin County Employees\' Retirement Association (SJCERA)',
      notes: 'Public Pension | Stockton, CA | Active consulting engagement. Linea supporting SJCERA\'s strategic technology roadmap and system modernization. Nate Haws serving as AI Implementation Lead for their AI advisory workstream. Engagement started January 2024.',
      pageLayout: JSON.stringify({ accentColor: 'amber', tagline: 'SJCERA — Public Pension Technology Modernization', keyStats: ['Active since Jan 2024', '~$2.1M engagement', 'AI strategy + system advisory', 'Stockton, CA'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-microsoft',
      clientName: 'Microsoft',
      notes: 'Technology Partner | Redmond, WA | Microsoft Azure — Implementation & Advisory engagement. Linea supporting Microsoft\'s public sector pension and benefits clients on Azure cloud adoption. Nate Haws leading AI integration advisory. Active from July 2025.',
      pageLayout: JSON.stringify({ accentColor: 'indigo', tagline: 'Microsoft — Azure Implementation & Advisory', keyStats: ['Active since Jul 2025', 'Azure cloud advisory', 'AI integration', 'Technology Partnership'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-brcera',
      clientName: 'Blue Ridge County Employees Retirement Association (BRCERA)',
      notes: 'Public Pension | Mid-Atlantic Region | Linea Secure providing vCISO services and cybersecurity consulting. BRCERA selected Linea Secure in 2025 following a security audit gap assessment. Idrissa Diallo leading engagement. Annual contract, renewable.',
      pageLayout: JSON.stringify({ accentColor: 'slate', tagline: 'BRCERA — Cybersecurity & vCISO Services', keyStats: ['Active 2026', 'vCISO services', 'Cybersecurity consulting', 'Linea Secure client'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-capebp',
      clientName: 'Capital Region Employee Benefits Plan (CAPEBP)',
      notes: 'Benefits Plan | Capital Region, US | Penetration testing engagement through Linea Secure. CAPEBP required third-party pen testing to meet DOL compliance. Short-duration project (March–June 2026) with Aditi Kapoor and Idrissa Diallo.',
      pageLayout: JSON.stringify({ accentColor: 'rose', tagline: 'CAPEBP — Penetration Testing & Compliance', keyStats: ['Q1–Q2 2026', 'DOL compliance', 'Pen testing', 'Linea Secure client'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-cprs',
      clientName: 'Cascade Public Retirement System (CPRS)',
      notes: 'Public Pension | Pacific Northwest, US | PAS modernization roadmap and procurement advisory. CPRS is evaluating replacement of their legacy pension administration system. Diana Kowalski leading engagement as PM. Requirements phase ongoing.',
      pageLayout: JSON.stringify({ accentColor: 'emerald', tagline: 'CPRS — PAS Modernization & Procurement', keyStats: ['Active 2025–2026', 'PAS procurement', 'Requirements phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-dtpf',
      clientName: 'Delta Region Teachers Pension Fund (DTPF)',
      notes: 'Public Pension | Delta Region, US | Implementation oversight for DTPF\'s new pension administration system. Linea providing PM and BA resources during the implementation phase. Diana Kowalski overseeing engagement alongside Sandra Okonkwo for OCM.',
      pageLayout: JSON.stringify({ accentColor: 'teal', tagline: 'DTPF — System Implementation Oversight', keyStats: ['Active 2025–2026', 'PAS implementation', 'Implementation phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-gltera',
      clientName: 'Great Lakes Teachers Retirement Association (GLTERA)',
      notes: 'Public Pension | Great Lakes Region, US | Multi-year implementation oversight engagement currently in Phase 3. Priya Mehta is PM, Richard Hammersmith and Brian Holloway supporting with BA and testing resources. Melissa Grant and Holloway handling testing. UAT phase through August 2026.',
      pageLayout: JSON.stringify({ accentColor: 'cyan', tagline: 'GLTERA — Implementation Oversight Phase 3', keyStats: ['Active 2025–2026', 'UAT phase', 'Phase 3 of 3', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-gppers',
      clientName: 'Great Plains Public Employees Retirement System (GPPERS)',
      notes: 'Public Pension | Great Plains Region, US | Full system implementation support engagement. Active through March 2027. Sandra Okonkwo (OCM) and Marcus Delacroix (OCM) supporting change management. Diana Kowalski providing oversight.',
      pageLayout: JSON.stringify({ accentColor: 'amber', tagline: 'GPPERS — PAS Implementation Support', keyStats: ['Active 2025–2027', 'Implementation phase', 'Long-term engagement', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-gpwcf',
      clientName: 'Great Plains Workers Compensation Fund (GPWCF)',
      notes: 'Workers\' Compensation Fund | Great Plains, US | Legacy data migration and conversion project. Kenji Nakamura (PM), Alex Drummond and Elena Popova (Data Analysts) and Gregory Pike (DBA) supporting the extraction, transformation, and load workstreams.',
      pageLayout: JSON.stringify({ accentColor: 'orange', tagline: 'GPWCF — Legacy Data Migration', keyStats: ['Active 2025–2026', 'Data migration', 'Implementation phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-hisl',
      clientName: 'Harbour Insurance Services Ltd (HISL)',
      notes: 'Insurance Services | Harbour Region, Canada | TPA platform assessment. HISL engaged Linea to assess their third-party administrator platform and provide a procurement roadmap. Short-term assessment engagement.',
      pageLayout: JSON.stringify({ accentColor: 'blue', tagline: 'HISL — TPA Platform Assessment', keyStats: ['Q1–Q2 2026', 'Insurance TPA', 'Platform assessment', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-hlpf',
      clientName: 'Heartland Laborers Pension Fund (HLPF)',
      notes: 'Labor Pension Fund | Heartland Region, US | Strategic planning and procurement support. HLPF is preparing for a major system replacement and engaged Linea for strategic advisory and RFP support. Carlos Reyes leading as PM.',
      pageLayout: JSON.stringify({ accentColor: 'lime', tagline: 'HLPF — Strategic Planning & Procurement', keyStats: ['Active 2025–2026', 'Strategic planning', 'Planning phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-lwcb',
      clientName: 'Lakeside Workers Compensation Board (LWCB)',
      notes: 'Workers\' Compensation | Great Lakes Region, Canada | Pre-implementation and SOW #3. LWCB selected their new system and Linea is supporting pre-implementation planning under the third Statement of Work. Wei Zhang (PM), Claire Beaumont (BA), Daniel Fortier (BA).',
      pageLayout: JSON.stringify({ accentColor: 'sky', tagline: 'LWCB — Pre-Implementation SOW #3', keyStats: ['Active 2025–2026', 'Pre-implementation', 'Requirements phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-nexgen',
      clientName: 'Nexgen Benefits Systems',
      notes: 'Internal | Linea internal placeholder client used for bench allocations and internal project assignments. Not a billable external client.',
      pageLayout: JSON.stringify({ accentColor: 'gray', tagline: 'Nexgen Benefits Systems — Internal Placeholder', keyStats: ['Internal use', 'Bench allocations', 'Non-billable', 'Linea internal'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-mpbc',
      clientName: 'Montrose Public Benefit Corp (MPBC)',
      notes: 'Public Benefits | Montrose Region, US | Identity and Access Management (IAM) review. Linea Secure providing cybersecurity assessment focusing on IAM gaps. Aditi Kapoor leading the assessment. Short engagement.',
      pageLayout: JSON.stringify({ accentColor: 'violet', tagline: 'MPBC — Identity & Access Management Review', keyStats: ['Q3 2026', 'IAM assessment', 'Linea Secure client', 'Cybersecurity'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-mwcb',
      clientName: 'Midlands Workers Compensation Board (MWCB)',
      notes: 'Workers\' Compensation | Midlands Region, US | Strategic consulting engagement. MWCB engaged Linea for strategic advisory on their technology and operations modernization program. Priya Mehta (PM).',
      pageLayout: JSON.stringify({ accentColor: 'rose', tagline: 'MWCB — Strategic Consulting', keyStats: ['Q1–Q3 2026', 'Strategic consulting', 'Assessment phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-nepers',
      clientName: 'New England Public Employees Retirement System (NEPERS)',
      notes: 'Public Pension | New England, US | RFP and vendor selection process. NEPERS is running a competitive procurement for a new pension administration system. Linea providing RFP management, vendor evaluation, and recommendation services. Priya Mehta (PM), Richard Hammersmith and Nicholas Zasada (BA).',
      pageLayout: JSON.stringify({ accentColor: 'indigo', tagline: 'NEPERS — RFP & Vendor Selection', keyStats: ['Active 2026', 'Vendor selection', 'Assessment phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-nprm',
      clientName: 'Northern Plains Risk Management Group (NPRM)',
      notes: 'Risk Management | Northern Plains, US | Cybersecurity risk assessment. Linea Secure providing comprehensive cyber risk assessment under NIST CSF framework. Idrissa Diallo leading assessment. Short engagement.',
      pageLayout: JSON.stringify({ accentColor: 'slate', tagline: 'NPRM — Cybersecurity Risk Assessment', keyStats: ['Q2 2026', 'NIST CSF', 'Risk assessment', 'Linea Secure client'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-nwwsb',
      clientName: 'Northwest Workers Safety Board (NWWSB)',
      notes: 'Workers\' Safety | Pacific Northwest, Canada | Multiple active engagements: Transformation Roadmap Phase B2 (Wei Zhang, Claire Beaumont, Andrew MacLeod), Data Quality & Cleansing (Kenji Nakamura, Alex Drummond), and vCISO & Threat Monitoring (Linea Secure). Largest current account by resource count.',
      pageLayout: JSON.stringify({ accentColor: 'green', tagline: 'NWWSB — Multi-Stream Transformation Program', keyStats: ['Active 2025–2027', '3 parallel workstreams', 'Data + tech + cyber', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-prppb',
      clientName: 'Prairie Region Public Pension Board (PRPPB)',
      notes: 'Public Pension | Prairie Region, Canada | Project Nexus data conversion. Large-scale historical data conversion and migration project. Kenji Nakamura (PM), Elena Popova and Gregory Pike (Data/DBA). Testing phase underway.',
      pageLayout: JSON.stringify({ accentColor: 'yellow', tagline: 'PRPPB — Project Nexus Data Conversion', keyStats: ['Active 2025–2026', 'Data conversion', 'Testing phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-rmfpf',
      clientName: 'Rocky Mountain First Responders Pension Fund (RMFPF)',
      notes: 'Public Pension | Rocky Mountain Region, US | Business transformation Phase 1. RMFPF launched a major modernization initiative and engaged Linea for Phase 1: current state discovery, gap analysis, and future state roadmap. Carlos Reyes (PM).',
      pageLayout: JSON.stringify({ accentColor: 'orange', tagline: 'RMFPF — Business Transformation Phase 1', keyStats: ['Active 2026', 'Discovery phase', 'Business transformation', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-sdera',
      clientName: 'Sunbelt District Employees Retirement Association (SDERA)',
      notes: 'Public Pension | Sunbelt Region, US | Current state assessment. SDERA seeking to understand their current technology and operational maturity before launching a procurement. Diana Kowalski (PM), Fatima Al-Hassan (BA), Sarah Johnson (PM). Short-term assessment.',
      pageLayout: JSON.stringify({ accentColor: 'amber', tagline: 'SDERA — Current State Assessment', keyStats: ['Q1–Q2 2026', 'Current state analysis', 'Assessment phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-tsmf',
      clientName: 'Tri-State Medical Liability Fund (TSMF)',
      notes: 'Medical Liability Fund | Tri-State Region, US | Additional consulting services. TSMF engaged Linea for supplemental advisory on their claims management system modernization. Carlos Reyes (PM). Short-term engagement.',
      pageLayout: JSON.stringify({ accentColor: 'red', tagline: 'TSMF — Additional Consulting Services', keyStats: ['Q1–Q3 2026', 'Claims management', 'Assessment phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
    {
      clientId: 'client-wcmpf',
      clientName: 'Western Canada Municipal Pension Fund (WCMPF)',
      notes: 'Public Pension | Western Canada | Benefits system review. WCMPF reviewing their current benefits administration platform for potential replacement or enhancement. Wei Zhang (PM), Daniel Fortier (BA). Planning phase.',
      pageLayout: JSON.stringify({ accentColor: 'teal', tagline: 'WCMPF — Benefits System Review', keyStats: ['Active 2026', 'System review', 'Planning phase', 'Marcus Webb — AE'] }),
      updatedAt: new Date(),
    },
  ];

  for (const cn of clientNotes) {
    await prisma.clientNote.upsert({
      where: { clientId: cn.clientId },
      update: { notes: cn.notes, pageLayout: cn.pageLayout, clientName: cn.clientName, updatedAt: cn.updatedAt },
      create: cn,
    });
  }
  console.log(`  ✓ Upserted ${clientNotes.length} client notes`);

  // ─── STEP 7: Update project clientIds to match ClientNote records ────────────
  console.log('\nStep 7: Linking project clientIds to ClientNote records...');

  const clientIdMap: Record<string, string> = {
    'Iowa Public Employees\' Retirement System (IPERS)': 'client-ipers',
    'New York City Police Pension Fund (NYCPPF)': 'client-nycppf',
    'South Carolina Public Employee Benefit Authority (PEBA)': 'client-sc-peba',
    'University of California Retirement System (UCRS)': 'client-ucrs',
    'Virginia Retirement System (VRS)': 'client-vrs',
    'Blue Ridge County Employees Retirement Association (BRCERA)': 'client-brcera',
    'Barbados National Insurance Scheme': 'client-barbados-nlc',
    'Capital Region Employee Benefits Plan (CAPEBP)': 'client-capebp',
    'Cascade Public Retirement System (CPRS)': 'client-cprs',
    'California State Teachers\' Retirement System (CalSTRS)': 'client-calstrs',
    'Delta Region Teachers Pension Fund (DTPF)': 'client-dtpf',
    'Great Lakes Teachers Retirement Association (GLTERA)': 'client-gltera',
    'Great Plains Public Employees Retirement System (GPPERS)': 'client-gppers',
    'Great Plains Workers Compensation Fund (GPWCF)': 'client-gpwcf',
    'Harbour Insurance Services Ltd (HISL)': 'client-hisl',
    'Heartland Laborers Pension Fund (HLPF)': 'client-hlpf',
    'Lakeside Workers Compensation Board (LWCB)': 'client-lwcb',
    'Nexgen Benefits Systems': 'client-nexgen',
    'Montrose Public Benefit Corp (MPBC)': 'client-mpbc',
    'Midlands Workers Compensation Board (MWCB)': 'client-mwcb',
    'Microsoft': 'client-microsoft',
    'New England Public Employees Retirement System (NEPERS)': 'client-nepers',
    'Northern Plains Risk Management Group (NPRM)': 'client-nprm',
    'Northwest Workers Safety Board (NWWSB)': 'client-nwwsb',
    'Prairie Region Public Pension Board (PRPPB)': 'client-prppb',
    'Rocky Mountain First Responders Pension Fund (RMFPF)': 'client-rmfpf',
    'San Joaquin County Employees\' Retirement Association (SJCERA)': 'client-sjcera',
    'School Employees Retirement System of Ohio (SERS)': 'client-sers-ohio',
    'Sunbelt District Employees Retirement Association (SDERA)': 'client-sdera',
    'Tri-State Medical Liability Fund (TSMF)': 'client-tsmf',
    'Western Canada Municipal Pension Fund (WCMPF)': 'client-wcmpf',
  };

  const allProjects = await prisma.project.findMany({ select: { id: true, clientName: true } });
  for (const proj of allProjects) {
    const cid = clientIdMap[proj.clientName];
    if (cid) {
      await prisma.project.update({ where: { id: proj.id }, data: { clientId: cid } });
    }
  }
  console.log(`  ✓ Linked ${allProjects.length} projects to ClientNote records`);

  // ─── STEP 8: Add extractedSkills for Sarah Johnson ──────────────────────────
  console.log('\nStep 8: Fixing Sarah Johnson extractedSkills...');
  await prisma.employee.update({
    where: { id: IDs.JOHNSON_S },
    data: {
      extractedSkills: JSON.stringify([
        { name: 'Engagement Management', yearsOfExp: 6 },
        { name: 'Project Management', yearsOfExp: 6 },
        { name: 'Pension Administration Systems', yearsOfExp: 5 },
        { name: 'Business Analysis', yearsOfExp: 7 },
        { name: 'Requirements Gathering', yearsOfExp: 7 },
        { name: 'Stakeholder Communication', yearsOfExp: 8 },
        { name: 'Vitech V3', yearsOfExp: 3 },
        { name: 'Workday', yearsOfExp: 2 },
        { name: 'Process Improvement', yearsOfExp: 5 },
        { name: 'Change Management', yearsOfExp: 4 },
      ]),
    },
  }).catch(() => {});
  console.log('  ✓ Added extractedSkills for Sarah Johnson');

  // ─── STEP 9: Add pageLayouts for all employees with empty {} ────────────────
  console.log('\nStep 9: Adding pageLayouts for employees without one...');

  // Template generators by role/level
  function executiveLayout(tagline: string, insight: string, accentColor: string, keyStats: string[], metrics: Array<{label:string;value:string}>) {
    return JSON.stringify({ profileType: 'executive', tagline, insight, accentColor, keyStats, primaryMetrics: metrics, sections: ['metrics', 'bio', 'skills'], showAllocationTimeline: false, statusBanner: null });
  }
  function consultantLayout(tagline: string, insight: string, accentColor: string, keyStats: string[]) {
    return JSON.stringify({ profileType: 'consultant', tagline, insight, accentColor, keyStats, sections: ['skills', 'allocations', 'bio'], showAllocationTimeline: true, statusBanner: null });
  }
  function seniorLayout(tagline: string, insight: string, accentColor: string, keyStats: string[]) {
    return JSON.stringify({ profileType: 'senior', tagline, insight, accentColor, keyStats, sections: ['skills', 'allocations', 'bio'], showAllocationTimeline: true, statusBanner: null });
  }
  function specialistLayout(tagline: string, insight: string, accentColor: string, keyStats: string[]) {
    return JSON.stringify({ profileType: 'specialist', tagline, insight, accentColor, keyStats, sections: ['certifications', 'skills', 'allocations', 'bio'], showAllocationTimeline: true, statusBanner: null });
  }
  function managerLayout(tagline: string, insight: string, accentColor: string, keyStats: string[]) {
    return JSON.stringify({ profileType: 'manager', tagline, insight, accentColor, keyStats, sections: ['metrics', 'skills', 'bio'], showAllocationTimeline: false, statusBanner: null });
  }
  function salesLayout(tagline: string, insight: string, accentColor: string, keyStats: string[], metrics: Array<{label:string;value:string}>) {
    return JSON.stringify({ profileType: 'sales', tagline, insight, accentColor, keyStats, primaryMetrics: metrics, sections: ['metrics', 'skills', 'bio'], showAllocationTimeline: false, statusBanner: null });
  }

  const pageLayoutUpdates: Array<{ id: string; pageLayout: string }> = [
    // ── Linea Solutions — C-Suite & Leadership ───────────────────────────────
    {
      id: IDs.COMSTOCK,
      pageLayout: executiveLayout(
        'Chief Delivery Officer — orchestrating Linea\'s global delivery excellence',
        'Rachel oversees all client delivery across 35+ active engagements. With 20+ years in pension technology and a track record of on-time, on-budget delivery, she has built Linea\'s reputation for execution. Her team of 40+ consultants spans the US and Canada.',
        'teal',
        ['CDO since 2019', '35+ active engagements', '40+ person delivery team', '98% client retention'],
        [{ label: 'Active Engagements', value: '35+' }, { label: 'Team Size', value: '40+' }, { label: 'On-Time Delivery', value: '96%' }, { label: 'Years Experience', value: '22' }],
      ),
    },
    {
      id: IDs.NASSER_FENN,
      pageLayout: executiveLayout(
        'Chief People Officer — building the talent engine behind Linea\'s growth',
        'Kimm leads Linea\'s people strategy across all four business units. She built the firm\'s career framework from scratch and has overseen 60%+ headcount growth in 5 years. Her background in pension operations gives her unique insight into the skills Linea\'s clients need.',
        'purple',
        ['CPO since 2020', '70-person firm', '60% growth in 5 years', 'Former pension ops leader'],
        [{ label: 'Total Headcount', value: '70+' }, { label: 'Growth (5yr)', value: '60%' }, { label: 'Retention Rate', value: '91%' }, { label: 'Avg Tenure', value: '4.2 yrs' }],
      ),
    },
    {
      id: IDs.HAWS_BRYCE,
      pageLayout: salesLayout(
        'SVP Sales & Marketing — scaling Linea\'s client portfolio across North America',
        'Bryce leads Linea\'s sales organization and marketing function. He joined as VP and was promoted to SVP after doubling the pipeline in 18 months. His focus is enterprise pension funds and workers\' compensation boards in the US and Canada.',
        'amber',
        ['SVP Sales since 2021', '$50M+ pipeline managed', 'US & Canada coverage', '15 enterprise accounts'],
        [{ label: 'Pipeline Value', value: '$50M+' }, { label: 'Accounts', value: '15' }, { label: 'Win Rate', value: '52%' }, { label: 'Growth (2yr)', value: '2x' }],
      ),
    },
    {
      id: IDs.WALKER,
      pageLayout: executiveLayout(
        'Vice President, Consulting Services — Linea\'s delivery infrastructure leader',
        'Mary Anne manages Linea\'s core consulting delivery team. She oversees resourcing, quality assurance, and methodology across all pension and benefits engagements. Her background includes 14 years at Big Four before joining Linea.',
        'indigo',
        ['VP Consulting since 2018', '14 yrs Big Four background', '25-person delivery team', 'Pension & benefits specialist'],
        [{ label: 'Team Size', value: '25+' }, { label: 'Engagements Managed', value: '50+' }, { label: 'Years Experience', value: '20' }, { label: 'Practice Areas', value: '3' }],
      ),
    },
    {
      id: IDs.KENNEDY,
      pageLayout: executiveLayout(
        'Vice President, Workers\' Compensation — Linea\'s WC practice leader',
        'Vickie built Linea\'s workers\' compensation practice from 2 consultants to an 8-person team with 12 active clients. She is a recognized authority on WC system modernization with expertise in KPMG Cranberry, Origami Risk, and custom adjudication platforms.',
        'rose',
        ['WC Practice Leader since 2017', '8-person WC team', '12 active WC clients', 'WC system modernization expert'],
        [{ label: 'WC Clients', value: '12' }, { label: 'Team Size', value: '8' }, { label: 'Practice Revenue', value: '$8M+' }, { label: 'Years WC Expertise', value: '18' }],
      ),
    },
    {
      id: IDs.TIGGELAAR,
      pageLayout: executiveLayout(
        'SVP Insurance Practice Leader — building Linea\'s insurance vertical',
        'Lon leads Linea\'s insurance practice with a focus on group benefits, disability, and medical liability. He has 25+ years in insurance technology consulting and brings deep relationships with carriers and TPAs across North America.',
        'orange',
        ['SVP Insurance since 2019', '25+ years insurance', 'Group benefits & disability', 'TPA advisory specialist'],
        [{ label: 'Insurance Clients', value: '8+' }, { label: 'Years Experience', value: '25+' }, { label: 'TPA Relationships', value: '15+' }, { label: 'Practice Revenue', value: '$5M+' }],
      ),
    },

    // ── Senior Leadership / Principals ────────────────────────────────────────
    {
      id: IDs.ZIERATH,
      pageLayout: managerLayout(
        'Senior Director Implementation Consulting — Linea\'s implementation delivery lead',
        'Kim oversees all Linea implementation projects, managing a team of engagement managers and consultants across 15+ active implementations. Her background in systems integration and Vitech V3 gives her hands-on credibility with project teams and clients.',
        'sky',
        ['15+ implementations managed', 'Vitech V3 expert', 'US & Canada delivery', '18 years pension tech'],
      ),
    },
    {
      id: IDs.LOVE,
      pageLayout: seniorLayout(
        'Senior Principal Consultant — ICON data conversion lead and pension migration authority',
        'Paul is Linea\'s most senior data conversion specialist with 20+ years on pension data migrations. He has led 5 major ICON data projects (IPERS, UCRS, VRS, APERS, and an ongoing engagement) and is the go-to resource for complex historical data transformation.',
        'teal',
        ['5 ICON data projects led', '20+ years pension data', 'APERS • IPERS • UCRS • VRS', 'SQL Server & SSIS expert'],
      ),
    },
    {
      id: IDs.LARSON,
      pageLayout: seniorLayout(
        'Principal Consultant — implementation PM and pension technology strategist',
        'Scott has 17 years of pension technology consulting experience, primarily in project management for large-scale system implementations. He has worked across CalPERS, LACERA, and several regional pension funds, bringing a structured PMO approach to complex multi-year programs.',
        'indigo',
        ['17 years pension consulting', 'Certified PMP', 'CalPERS • LACERA engagements', 'Multi-year program management'],
      ),
    },
    {
      id: IDs.REED,
      pageLayout: seniorLayout(
        'Principal Consultant — benefits administration and public sector modernization',
        'Patricia specializes in benefits administration system modernization for public sector clients. She has deep experience with Open Enrollment redesign, benefit eligibility rules, and self-service portal implementations. Her work at PEBA and NYCPPF is frequently cited by clients.',
        'violet',
        ['Principal since 2016', 'SC PEBA • NYCPPF engagements', 'Open enrollment specialist', '16 years public sector'],
      ),
    },
    {
      id: IDs.GUPPY,
      pageLayout: managerLayout(
        'Director, Work Disability Prevention — Linea\'s WDP program lead',
        'Ryan directs Linea\'s Work Disability Prevention (WDP) advisory practice for workers\' compensation clients in Canada and the Caribbean. His pioneering WDP methodology has been adopted by 4 workers\' comp boards. He led the Barbados National Insurance Social Program modernization advisory.',
        'green',
        ['WDP Practice Director', 'Canada & Caribbean WC', 'Barbados NI engagement lead', '12 years WDP expertise'],
      ),
    },
    {
      id: IDs.MAHONEY,
      pageLayout: seniorLayout(
        'Associate Principal Consultant — pension system configuration and integration',
        'Jessica has 10 years of deep technical and functional experience on pension system implementations. She specializes in system configuration, data mapping, and integration with payroll and HR platforms. She recently completed a 2-year engagement at NYCPPF.',
        'cyan',
        ['NYCPPF engagement lead', 'System configuration expert', '10 years pension tech', 'Integration specialist'],
      ),
    },
    {
      id: IDs.MINTON,
      pageLayout: seniorLayout(
        'Associate Principal Consultant — SJCERA consulting & pension operations advisory',
        'Stephanie is a functional pension consultant with 9 years of experience spanning plan administration, regulatory compliance, and system modernization. Currently supporting SJCERA on their technology consulting engagement.',
        'rose',
        ['SJCERA engagement', '9 years pension ops', 'Regulatory compliance expert', 'Pension plan administration'],
      ),
    },
    {
      id: IDs.SCHAPPERT,
      pageLayout: seniorLayout(
        'Associate Principal Consultant — CalSTRS AI implementation and data transformation',
        'Dana brings 8 years of consulting experience with a focus on AI and data-driven transformation in the public sector. She joined the CalSTRS AI Deployment engagement in 2026 to lead the business analysis and change management workstreams.',
        'amber',
        ['CalSTRS AI engagement', '8 years consulting', 'AI implementation specialist', 'Public sector data transformation'],
      ),
    },
    {
      id: IDs.ZASADA,
      pageLayout: seniorLayout(
        'Associate Principal Consultant — RFP advisory and vendor evaluation specialist',
        'Nicholas has led 6 full vendor selection processes for pension systems, including NEPERS, and developed Linea\'s vendor evaluation scoring framework. He holds a PMP certification and specializes in requirements documentation and functional gap analysis.',
        'blue',
        ['6 RFP processes led', 'Vendor evaluation expert', 'PMP certified', 'Pension system procurement'],
      ),
    },
    {
      id: IDs.HAWS_NATE,
      pageLayout: executiveLayout(
        'Associate Principal Consultant & AI Researcher — Linea\'s AI innovation lead',
        'Nate bridges pension technology and AI to build solutions that modernize how public sector clients operate. He leads the RAMP initiative internally and advises CalSTRS, SERS Ohio, and SJCERA on AI strategy and deployment. Former ML engineer at a FinTech startup.',
        'violet',
        ['RAMP initiative lead', 'CalSTRS • SERS • SJCERA AI advisor', 'Former ML engineer', 'AI & pension tech fusion'],
        [{ label: 'AI Engagements', value: '4' }, { label: 'Clients Advised', value: '3' }, { label: 'Models Deployed', value: '8+' }, { label: 'Years AI Research', value: '6' }],
      ),
    },

    // ── Senior Consultants / Engagement Managers ─────────────────────────────
    {
      id: IDs.HAMMERSMITH,
      // Already has a pageLayout — skip
      pageLayout: '', // will be skipped below
    },
    {
      id: IDs.JOHNSON_S,
      pageLayout: seniorLayout(
        'Engagement Manager — pension modernization and current state assessments',
        'Sarah joined Linea from a regional pension administration role and brings client-side empathy to every engagement. She currently leads the SDERA current state assessment and has supported 8+ pension technology projects across Linea\'s portfolio.',
        'teal',
        ['SDERA assessment lead', '8+ pension projects', 'Client-side background', 'Requirements & process design'],
      ),
    },
    {
      id: IDs.FITZGERALD,
      pageLayout: seniorLayout(
        'Senior Consultant — PAS procurement and business analysis',
        'Eleanor is a business analyst and engagement management specialist who has worked on 6 PAS procurement and implementation projects. Her expertise in gap analysis, functional requirements, and vendor evaluation is deployed across CPRS and HLPF engagements.',
        'emerald',
        ['CPRS & HLPF engagements', '6 PAS procurement projects', 'Gap analysis specialist', '11 years pension consulting'],
      ),
    },
    {
      id: IDs.OKONKWO_A,
      pageLayout: seniorLayout(
        'Senior Consultant — pension implementation and business process redesign',
        'Aisha brings 9 years of consulting experience with a focus on business process optimization and system implementation for public pension funds. She is currently assigned to SDERA as a BA and recently completed a major implementation at GLTERA.',
        'amber',
        ['SDERA & GLTERA engagements', 'BPR specialist', '9 years pension consulting', 'Process redesign & mapping'],
      ),
    },
    {
      id: IDs.BLACKWOOD,
      pageLayout: seniorLayout(
        'Senior Consultant — pension benefits administration and regulatory compliance',
        'Thomas has 10 years of consulting experience with deep expertise in pension benefit calculations, statutory compliance, and member services operations. He is joining the HLPF engagement as a business analyst and has prior experience at CalPERS and LACERA.',
        'slate',
        ['HLPF engagement', '10 years pension ops', 'Benefit calc & compliance', 'CalPERS • LACERA background'],
      ),
    },
    {
      id: IDs.OKONKWO_S,
      pageLayout: seniorLayout(
        'Senior Specialist, OCM — organizational change management and training',
        'Sandra leads OCM workstreams on large-scale pension system implementations. She has designed and delivered training programs for 500+ end users across 5 pension fund clients. Currently supporting GPPERS and DTPF.',
        'orange',
        ['GPPERS & DTPF OCM lead', '500+ users trained', '5 OCM programs delivered', 'Change management cert.'],
      ),
    },
    {
      id: IDs.PAPPA,
      pageLayout: seniorLayout(
        'Senior Consultant — BPI & Lean Six Sigma Master Black Belt',
        'Gerard is Linea\'s process improvement authority. As a Lean Six Sigma Master Black Belt, he leads business process improvement engagements for insurance and WC clients. He has reduced operational cycle times by 30–60% across 4 major BPI programs.',
        'red',
        ['Lean 6σ Master Black Belt', '4 BPI programs led', '30-60% cycle time reduction', 'Insurance & WC specialist'],
      ),
    },
    {
      id: IDs.WEBSTER,
      pageLayout: seniorLayout(
        'Senior Consultant, WC Business Development — workers\' compensation advisory and BD',
        'Fred combines 14 years of workers\' compensation domain expertise with business development experience. He has helped grow Linea\'s WC practice by building relationships with key WC boards in Canada and the US while supporting client engagements on Barbados and select domestic clients.',
        'rose',
        ['WC Business Development', 'Canada & US WC expertise', 'Barbados NI engagement', '14 years WC domain'],
      ),
    },

    // ── Consultants / Associates ──────────────────────────────────────────────
    {
      id: IDs.MEHTA,
      // Already has a layout — skip
      pageLayout: '',
    },
    {
      id: IDs.REYES,
      pageLayout: seniorLayout(
        'Senior Engagement Manager — strategic procurement and business transformation',
        'Carlos manages complex multi-workstream engagements for pension and workers\' compensation clients. He is currently leading HLPF, TSMF, and RMFPF simultaneously. His background in public sector technology procurement makes him effective at vendor selection and contract advisory.',
        'sky',
        ['HLPF • RMFPF • TSMF leads', 'Procurement & BPR specialist', '12 years consulting', 'Public sector technology'],
      ),
    },
    {
      id: IDs.CHEN_G,
      pageLayout: consultantLayout(
        'Consultant — pension business analysis and system configuration',
        'Gabrielle is a rising consultant with 4 years of experience on PAS implementation projects. She is currently a BA on CPRS and DTPF. Her background in actuarial analytics gives her unusual strength in benefit calculation validation.',
        'emerald',
        ['CPRS & DTPF BA', 'Actuarial analytics background', '4 years pension consulting', 'Benefit calc validation'],
      ),
    },
    {
      id: IDs.NGUYEN_P,
      pageLayout: consultantLayout(
        'Consultant — pension data analysis and business requirements',
        'Patrick is a consultant supporting data analysis and business requirements gathering on Linea\'s active engagements. He has experience with SQL, data profiling, and gap analysis on pension administration systems. Currently between assignments.',
        'teal',
        ['Data analysis & BRD', 'SQL & data profiling', '3 years consulting', 'Pension system BRDs'],
      ),
    },
    {
      id: IDs.AL_HASSAN,
      pageLayout: consultantLayout(
        'Consultant — business analysis and current state documentation',
        'Fatima is a consultant with strong analytical and documentation skills. She is currently assigned to SDERA (BA role, 60%) and transitioning to MWCB in May 2026. Her background in public policy research complements her pension consulting work.',
        'amber',
        ['SDERA & MWCB assignments', 'BA & documentation', '3 years pension consulting', 'Public policy background'],
      ),
    },
    {
      id: IDs.WRIGHT,
      pageLayout: consultantLayout(
        'Consultant — pension implementation support and user acceptance testing',
        'Damon supports pension system implementations with a focus on UAT coordination, defect tracking, and end-user training delivery. He is available for assignment following recent project completion.',
        'violet',
        ['UAT & testing specialist', 'Defect tracking & triage', '3 years pension consulting', 'End-user training delivery'],
      ),
    },
    {
      id: IDs.MORRIS,
      pageLayout: specialistLayout(
        'Specialist, Technical Analysis — data migration and system integration',
        'Angela is a technical analyst specializing in data mapping, migration validation, and integration testing for pension systems. She brings strong SQL and Python skills to data quality and conversion projects.',
        'slate',
        ['Data mapping & migration', 'SQL & Python proficient', 'Integration testing', '4 years pension data work'],
      ),
    },
    {
      id: IDs.ANDERSEN,
      pageLayout: specialistLayout(
        'Senior Specialist, Technical Analysis — data quality and system conversion',
        'Robert is a senior data analyst with deep expertise in data quality assessment and historical data conversion for pension administration systems. Currently assigned to RMFPF and NWWSB as DataAnalyst.',
        'teal',
        ['RMFPF & NWWSB assignments', 'Data quality specialist', '7 years pension data', 'SQL Server & SSIS'],
      ),
    },
    {
      id: IDs.THOMPSON_K,
      pageLayout: specialistLayout(
        'Specialist, Technical Analysis — system configuration and data validation',
        'Kevin T. is a technical specialist focused on pension system configuration validation and data integrity testing. He supports implementations by verifying that system setup accurately reflects plan document rules.',
        'sky',
        ['System config validation', 'Data integrity testing', '4 years pension tech', 'Plan document analysis'],
      ),
    },
    {
      id: IDs.GRANT,
      pageLayout: specialistLayout(
        'Senior Specialist, Testing — QA lead for pension system implementations',
        'Melissa leads testing workstreams on large pension system implementations. She has developed and executed test plans covering 200,000+ test cases across 4 implementations. Currently QA lead on GLTERA and preparing for GPPERS.',
        'emerald',
        ['GLTERA QA lead', '200K+ test cases executed', '4 implementations tested', 'Test plan development'],
      ),
    },
    {
      id: IDs.HOLLOWAY,
      pageLayout: specialistLayout(
        'Specialist, Testing — system testing and defect lifecycle management',
        'Brian H. supports system testing on pension implementations, covering functional, regression, and integration testing. He has worked alongside Melissa Grant on GLTERA and is building expertise in automated testing frameworks.',
        'blue',
        ['GLTERA testing support', 'Functional & regression testing', '3 years pension testing', 'Defect lifecycle management'],
      ),
    },
    {
      id: IDs.DELACROIX,
      pageLayout: specialistLayout(
        'Specialist, OCM — organizational change management and stakeholder engagement',
        'Marcus D. supports change management workstreams with a focus on stakeholder analysis, communication planning, and training delivery. He has experience supporting GPPERS and brings a background in organizational psychology.',
        'purple',
        ['GPPERS OCM support', 'Stakeholder engagement', 'Communications planning', 'Org psychology background'],
      ),
    },
    {
      id: IDs.PARK_J,
      pageLayout: consultantLayout(
        'Associate — pension consulting and project support',
        'Jordan is a junior consultant supporting Linea\'s engagement teams with project coordination, documentation, and stakeholder communications. She joined Linea following a graduate program in public administration.',
        'green',
        ['Project coordination', 'Documentation & reporting', '2 years at Linea', 'Public admin background'],
      ),
    },
    {
      id: IDs.PIERCE,
      pageLayout: consultantLayout(
        'Associate — business analysis support and research',
        'Samantha is an associate consultant supporting business analysis activities on active engagements. She assists senior consultants with requirements documentation, stakeholder meeting facilitation, and research.',
        'teal',
        ['BA support & research', 'Requirements documentation', '2 years at Linea', 'Stakeholder facilitation'],
      ),
    },
    {
      id: IDs.JOHNY_AI,
      pageLayout: specialistLayout(
        'Specialist, AI & Innovation — building RAMP and advising on AI adoption',
        'Deepak leads AI innovation initiatives at Linea, including the RAMP (Resource Allocation Management Platform) project. He brings expertise in LLM integration, prompt engineering, and production AI system design. He serves as an internal advisor for AI deployment engagements.',
        'violet',
        ['RAMP platform developer', 'LLM & prompt engineering', 'AI innovation lead', 'Internal AI advisor'],
      ),
    },

    // ── ICON Team ─────────────────────────────────────────────────────────────
    {
      id: IDs.DRUMMOND,
      pageLayout: consultantLayout(
        'Reconciliation Analyst — pension data reconciliation and conversion QA',
        'Alex is a reconciliation analyst supporting ICON\'s data conversion projects. She specializes in extracting, validating, and reconciling pension fund historical data during system migrations. Currently supporting GPWCF and NWWSB.',
        'amber',
        ['GPWCF & NWWSB analyst', 'Data reconciliation expert', 'Pension data conversion', 'ETL validation'],
      ),
    },
    {
      id: IDs.NAKAMURA,
      pageLayout: managerLayout(
        'Senior Engagement Manager, Data — ICON data conversion program lead',
        'Kenji leads ICON\'s data conversion engagement portfolio. He oversees multiple simultaneous data migration projects (GPWCF, PRPPB, NWWSB) and manages the ICON analyst team. He has 12 years of experience in pension data transformation and is a recognized expert in SQL Server data architectures for pension systems.',
        'sky',
        ['ICON data team lead', '12 years pension data', 'GPWCF • PRPPB • NWWSB', 'SQL Server expert'],
      ),
    },
    {
      id: IDs.POPOVA,
      pageLayout: consultantLayout(
        'Data Conversion Engineer — pension data ETL and migration engineering',
        'Elena is a data conversion engineer specializing in pension administration data extraction, transformation, and loading. She has engineered conversion pipelines for PRPPB and GPWCF with a focus on data accuracy and full historical record integrity.',
        'cyan',
        ['PRPPB & GPWCF conversion', 'ETL pipeline engineering', 'Data accuracy validation', '6 years pension data'],
      ),
    },

    // ── Linea Secure ──────────────────────────────────────────────────────────
    {
      id: IDs.DEWAR,
      pageLayout: executiveLayout(
        'President, Linea Secure — building the cybersecurity arm of the Linea Group',
        'Peter co-founded Linea Secure to bring specialized cybersecurity expertise to the pension and benefits industry. Under his leadership, Linea Secure has grown to 9 consultants serving 8 clients. He oversees all vCISO engagements and has deep expertise in NIST CSF, ISO 27001, and FedRAMP.',
        'slate',
        ['Co-founder, Linea Secure', '8 cybersecurity clients', 'NIST CSF & ISO 27001', 'PCSF program lead'],
        [{ label: 'Cyber Clients', value: '8' }, { label: 'Team Size', value: '9' }, { label: 'Frameworks', value: 'NIST • ISO • FedRAMP' }, { label: 'Years in Cyber', value: '20' }],
      ),
    },
    {
      id: IDs.TODD,
      pageLayout: managerLayout(
        'VP, Cybersecurity & Data Solutions — Linea Secure delivery lead',
        'Jason oversees all Linea Secure client engagements and manages the delivery team. With 15 years in cybersecurity consulting for financial services and public sector, he brings deep expertise in penetration testing, threat intelligence, and risk frameworks. He oversees BRCERA and CAPEBP engagements.',
        'slate',
        ['Linea Secure delivery VP', 'BRCERA & CAPEBP oversight', 'Pen testing & threat intel', '15 years cyber consulting'],
      ),
    },
    {
      id: IDs.HODGSON,
      pageLayout: managerLayout(
        'Manager of Operations, Linea Secure — keeping delivery running smoothly',
        'Bradford manages Linea Secure\'s operations: resource planning, utilization tracking, contract administration, and client billing. He also provides oversight support on the BRCERA vCISO engagement. His background in IT operations management ensures the practice runs efficiently.',
        'gray',
        ['Linea Secure operations lead', 'BRCERA oversight support', 'Resource & contract mgmt', '10 years IT ops management'],
      ),
    },
    {
      id: IDs.COLKER_LSEC,
      pageLayout: managerLayout(
        'Principal, Linea Secure — vCISO advisory and client relationship management',
        'Brian is a senior principal at Linea Secure with a dual role in client advisory and business development for the cybersecurity practice. He has 20+ years of experience in financial services IT security and co-founded the Linea Secure entity. He also holds an executive role at Linea Solutions as a Co-Founder.',
        'slate',
        ['Linea Secure Principal', 'vCISO advisory', 'Co-founder, Linea Group', '20+ years FS cybersecurity'],
      ),
    },
    {
      id: IDs.KIRCHMEIER,
      pageLayout: seniorLayout(
        'Senior Consultant, Linea Secure — cybersecurity operations and compliance',
        'Cassandra is a cybersecurity generalist with 8 years of experience in compliance, security operations, and risk management for public sector clients. She holds CISSP and CISA certifications and supports Linea Secure\'s risk assessment and compliance advisory engagements.',
        'slate',
        ['CISSP & CISA certified', 'Risk & compliance advisory', '8 years public sector cyber', 'SOC 2 & NIST CSF'],
      ),
    },
    {
      id: IDs.DIALLO,
      pageLayout: managerLayout(
        'Senior Engagement Manager, Cyber — vCISO program lead and threat advisory',
        'Idrissa manages Linea Secure\'s most active client engagements — BRCERA vCISO, NWWSB vCISO, CAPEBP penetration testing, and NPRM risk assessment — simultaneously. He has 10 years of experience in vCISO advisory for financial services regulators and public pension funds.',
        'slate',
        ['BRCERA • NWWSB • CAPEBP • NPRM', 'vCISO program lead', '10 years FS cybersecurity', 'Threat intel & advisory'],
      ),
    },
    {
      id: IDs.OSEI,
      pageLayout: specialistLayout(
        'Cybersecurity Consultant — penetration testing and threat monitoring',
        'Ferdinand specializes in penetration testing, vulnerability assessment, and security monitoring. He holds CEH and OSCP certifications and supports Linea Secure\'s offensive security practice. He is a key resource on the CAPEBP penetration testing and NWWSB threat monitoring engagements.',
        'slate',
        ['CAPEBP pen test specialist', 'CEH & OSCP certified', 'Offensive security', 'Threat monitoring'],
      ),
    },
    {
      id: IDs.SUNDARAM,
      pageLayout: specialistLayout(
        'Cybersecurity Consultant — identity, access management, and security compliance',
        'Priya S. focuses on identity and access management (IAM) assessments and security compliance advisory. She holds CompTIA Security+ and Azure Security Engineer certifications. She supports the MPBC IAM review and NPRM risk assessments.',
        'slate',
        ['MPBC IAM specialist', 'CompTIA Sec+ & Azure cert.', 'IAM & access reviews', 'Security compliance'],
      ),
    },

    // ── Linea Solutions ULC ───────────────────────────────────────────────────
    {
      id: IDs.HOULE,
      pageLayout: managerLayout(
        'Director, RAMP Program — leading Linea\'s internal AI platform initiative',
        'Vincent directs the RAMP (Resource Allocation Management Platform) program, Linea\'s flagship internal AI initiative. He coordinates with the AI research team (Nate Haws, Deepak Johny) and ensures the platform meets the needs of all four Linea business units. Based in Montreal.',
        'violet',
        ['RAMP Program Director', 'AI platform governance', 'Montreal-based', 'ULC cross-functional lead'],
      ),
    },
    {
      id: IDs.LI,
      pageLayout: seniorLayout(
        'Senior Pension Consultant & Innovation Lab Advisor — pension expertise meets AI',
        'Angela is a senior pension consultant based in Toronto with 15 years of Canadian pension regulatory expertise. She advises the Linea Innovation Lab on AI applications in pension administration and supports ULC client engagements. She holds FCA and CEBS designations.',
        'teal',
        ['FCA & CEBS designations', '15 years Canadian pension', 'Innovation Lab advisor', 'Toronto-based'],
      ),
    },
    {
      id: IDs.MARSHALL,
      pageLayout: seniorLayout(
        'Associate Principal Consultant — ULC delivery lead for Western Canada & CPRS',
        'Bonnie manages Linea Solutions ULC\'s delivery team, currently focused on the CPRS PAS Modernization Roadmap. She leads a team of 6 ULC consultants across NWWSB, LWCB, HISL, and CPRS engagements. Based in Vancouver.',
        'sky',
        ['ULC delivery team lead', 'CPRS engagement PM', '6-person ULC team', 'Vancouver-based'],
      ),
    },
    {
      id: IDs.BEAUMONT,
      pageLayout: seniorLayout(
        'Senior Consultant — NWWSB transformation lead and pension BA',
        'Claire is the primary BA on NWWSB\'s multi-year Transformation Roadmap (Phase B2) and is transitioning to LWCB Pre-Implementation SOW #3. She has 8 years of workers\' compensation and pension consulting experience. Based in Vancouver.',
        'green',
        ['NWWSB & LWCB engagements', '8 years WC & pension', 'Transformation roadmap BA', 'Vancouver-based'],
      ),
    },
    {
      id: IDs.MACLEOD,
      pageLayout: consultantLayout(
        'Consultant — NWWSB transformation and HISL platform assessment',
        'Andrew is a consultant currently assigned to NWWSB Transformation (BA support) and HISL Platform Assessment (BA). Based in Calgary, he brings 5 years of public sector technology consulting experience with a focus on WC and pension systems.',
        'teal',
        ['NWWSB & HISL assignments', '5 years public sector tech', 'BA & documentation', 'Calgary-based'],
      ),
    },
    {
      id: IDs.FORTIER,
      pageLayout: consultantLayout(
        'Consultant — LWCB pre-implementation and WCMPF benefits system review',
        'Daniel is a consultant assigned to LWCB Pre-Implementation (BA) and WCMPF Benefits System Review (BA). He brings 4 years of consulting experience with a focus on requirements gathering and functional design for benefits administration systems. Based in Ottawa.',
        'amber',
        ['LWCB & WCMPF assignments', '4 years benefits consulting', 'Requirements & functional design', 'Ottawa-based'],
      ),
    },
    {
      id: IDs.ROBERTSON,
      pageLayout: consultantLayout(
        'Associate — consulting support and project administration',
        'Emma is a junior consultant providing project administration, documentation, and support on ULC engagements. Based in Toronto, she recently joined Linea after completing a public administration graduate program at the University of Toronto.',
        'violet',
        ['ULC project support', 'Project administration', 'Recent graduate', 'Toronto-based'],
      ),
    },
    {
      id: IDs.SHARMA_A,
      pageLayout: specialistLayout(
        'Specialist, Testing — pension system testing for ULC engagements',
        'Anika is a testing specialist supporting ULC engagements with functional and integration testing. She works with the QA team on LWCB and is experienced in test case design, defect management, and regression testing for pension administration systems.',
        'rose',
        ['LWCB testing support', 'Functional & integration testing', 'Test case design', '3 years pension testing'],
      ),
    },
    {
      id: IDs.TREMBLAY,
      pageLayout: specialistLayout(
        'Specialist, OCM — change management and training for Canadian pension clients',
        'Yasmine is an OCM specialist supporting Canadian pension and WC clients on change management, training, and user adoption. She has delivered training programs in both English and French. Currently supporting NWWSB and CPRS OCM workstreams.',
        'orange',
        ['NWWSB & CPRS OCM', 'Bilingual (EN/FR)', 'Training delivery', 'Ottawa-based'],
      ),
    },
    {
      id: IDs.ZHANG,
      pageLayout: seniorLayout(
        'Senior Engagement Manager — Western Canada consulting lead (NWWSB, LWCB, HISL, WCMPF)',
        'Wei manages 4 simultaneous consulting engagements across Western Canada (NWWSB, LWCB, HISL, WCMPF). She has 11 years of pension and workers\' compensation consulting experience and is based in Vancouver. She serves as the primary Linea contact for all Western Canada clients.',
        'sky',
        ['4 concurrent engagements', 'Western Canada lead', '11 years WC & pension', 'Vancouver-based'],
      ),
    },
  ];

  let layoutsAdded = 0;
  for (const update of pageLayoutUpdates) {
    if (!update.pageLayout) continue; // skip empty (already has layout)
    const existing = await prisma.employee.findUnique({ where: { id: update.id }, select: { pageLayout: true } });
    if (!existing || existing.pageLayout !== '{}') {
      // Already has a non-default layout — don't overwrite
      continue;
    }
    await prisma.employee.update({
      where: { id: update.id },
      data: { pageLayout: update.pageLayout },
    }).catch((e) => console.log(`  ⚠ pageLayout update failed for ${update.id}: ${e.message}`));
    layoutsAdded++;
  }
  console.log(`  ✓ Added pageLayouts for ${layoutsAdded} employees`);

  // ─── DONE ────────────────────────────────────────────────────────────────────
  console.log('\n✅ All data fixes complete!\n');

  // Summary counts
  const counts = await Promise.all([
    prisma.employee.count(),
    prisma.project.count(),
    prisma.allocation.count(),
    prisma.clientNote.count(),
  ]);
  console.log(`Final counts: ${counts[0]} employees | ${counts[1]} projects | ${counts[2]} allocations | ${counts[3]} client notes`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
